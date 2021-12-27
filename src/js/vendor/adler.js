function createComponent(name, string){
    var self = {}
    var textString = stringv
    var name = name

    function render(params) {
        return textString
    }
    self.render = render
    return self
}


function createAdler({
    container = document.body,
    parentLens = undefined,
    type = "root",
    parent= undefined,
    lenses = {},
    name='root',
    root=undefined,
    textString ="",
    params={},
    instances={},
    renderAt=undefined,
    wrapperClass="",
  } = {}){
    var self = {}
    console.log(lenses)
    // var lenses = Object.assign({},parentLenses )
    var renderArray = []
    if (!root){
        root = self;
    }
    var wrapper = createWrapper()
  
    
    function addCSS(cssText){
        var style = document.createElement('style');
        style.innerHTML = cssText;
        document.head.appendChild(style);
    }

    function createLens(name, string, wrapperClass) {
        // lens[name] = createComponent(name, string)
        // let newAdler = createAdler({name:name, textString:string, lenses:lenses})
        //  lenses[name] =newAdler
        // return newAdler

        let newAdler = {name:name, textString:string, lenses:lenses, wrapperClass: wrapperClass}
         lenses[name] =newAdler
        return newAdler

    }
    let inject = (str, obj) => str.replace(/\%{(.*?)}/g, (x,g)=> obj[g]);

    function createWrapper() {
        let wrapper ={}
        wrapper.DOMElement = document.createElement("div")
        if (wrapperClass != "") {
            wrapper.DOMElement.classList += ('adler_panel '+wrapperClass)
        }else{
            wrapper.DOMElement.classList ="adler_panel"
        }
        return wrapper

    }

    function lens(lensName) {
        return lenses[lensName]
    }
    function addLens(lensName,params, renderAt) {
        let newElement = createAdler({name:lenses[lensName].name, root:root, instances:instances, textString:lenses[lensName].textString, lenses:lenses[lensName].lenses,parent:self, container:wrapper, params:params, renderAt:renderAt, wrapperClass:lenses[lensName].wrapperClass})
        var toRender = {
            lens:newElement,
            params:params,
            renderAt:renderAt,
        }
        addInstance(newElement, params.as || lenses[lensName].name)
        renderArray.push(toRender)
        return newElement
    }

    function addInstance(element, id){//record an instance in the root to find it later
        instances[id] = element;
        console.log(instances)
    }

    function getLens(id){//record an instance in the root to find it later
        return instances[id]
    }

    function render() {
        if (params.for) {
            let duplicatedParams = getFormatedParamsCopy(params)
            wrapper = renderMultiple(duplicatedParams)
            setUpChildren()
            mountMultiple()
        }else{
            wrapper = renderTemplate(params)
            setUpChildren()
            mount()
        }
        
    }
    function renderMultiple(params) {
        if (typeof params.for === 'object' && !Array.isArray(params.for) && params.for !== null){
            // for (const key in params.for) { //NOT IMPLEMENTED YET
            //     if (user.hasOwnProperty(key)) {
            
            //         console.log(`${key}: ${user[key]}`);
            //     }
            // }
        }else if(Array.isArray(params.for)) {
            let arrayWrapper = createWrapper()
            for (let index = 0; index < params.for.length; index++) {
                const element = params.for[index];
                
                arrayWrapper.DOMElement.appendChild( renderTemplate(params,index).DOMElement )
            }

            // arrayWrapper.DOMElement = arrayWrapper.DOMElement.firstElementChild; 
            return arrayWrapper
        }else if(true){

        }
        
        
    }
    function renderTemplate(params,paramIndex) {
        
        let localWrapper = createWrapper()
        
        var textToDisplay =textString
        console.log(typeof textString, params.data )
        if(typeof textString === 'function'){
            textToDisplay = textString( getParamsData(params,paramIndex) )
        }else if (params.data) {
            textToDisplay = inject(textString, getParamsData(params,paramIndex) )
        }
        localWrapper.DOMElement.innerHTML = textToDisplay
        if (localWrapper.DOMElement.childElementCount==1) {
            localWrapper.DOMElement = localWrapper.DOMElement.firstElementChild; 
            console.log(localWrapper)
        }
        // if (name != "root") {
        //     if (renderAt) {
        //         container.querySelector(renderAt).appendChild(wrapper)
        //     }else{
        //         container.appendChild(wrapper)
        //     }
            
        // }
        console.log(localWrapper.DOMElement.innerHTML)
        
        if (params && params.on) {
            console.log(params.on)
            if ( Array.isArray(params.on[0]) ) {
                for (let index = 0; index < params.on.length; index++) {
                    const action = params.on[index];
                    let target = localWrapper.DOMElement.querySelector(action[0])
                    if (target) {
                        function callback(event) {
                            action[2](event, getParamsData(params,paramIndex))
                        }
                        target.addEventListener(action[1],callback)
                    }
                }
            }else{
                const action = params.on;
                    let target = localWrapper.DOMElement.querySelector(action[0])
                    if (target) {
                        // var callback = function (wrapper) {
                            
                        // }
                        function callback(event) {
                            action[2](event, getParamsData(params,paramIndex))
                        }
                        target.addEventListener(action[1],callback)
                    }
            }
            
        }   
        
        return localWrapper
    }

    function getParamsData(params,paramIndex) {
        let newData = params.data || {}
        if (params.for && (paramIndex || paramIndex==0 )) {
            newData = Object.assign({},newData, params.for[paramIndex] )
        }
        return newData
        
    }
    function getFormatedParamsCopy(params) {
        let newParams= Object.assign({}, params)
        if (typeof params.for === 'function') {
            newParams.for = newParams.for()
        }
        return newParams
        
    }


    function setUpChildren() {
        for (let index = 0; index < renderArray.length; index++) {
            const element = renderArray[index];
            element.lens.render()
            console.log(params)
            
        }
    }
    function mount() {
        if (!parent) {
            container.appendChild(wrapper.DOMElement)
        }else if (renderAt) {
            parent.getElement(renderAt).appendChild(wrapper.DOMElement)
        }else{
            parent.getElement('root').appendChild(wrapper.DOMElement)
        }
    }
    function mountMultiple() {

        function move(oldParent, newParent) {
            while (oldParent.childNodes.length > 0) {
                newParent.appendChild(oldParent.childNodes[0]);
                console.debug(newParent)
            }
        }
        if (!parent) {
            move(wrapper.DOMElement, container)
        }else if (renderAt) {
            move(wrapper.DOMElement, parent.getElement(renderAt))
        }else{
            move(wrapper.DOMElement, parent.getElement('root'))
        }
    }

    function remove() {
        wrapper.DOMElement.remove()
        if(params.for){ // if multiple clean parent renterAt content
            parent.getElement(renderAt).innerHTML =""
        }
    }

    function update() {
        remove();
        render();
    }

    function set(param, value) {
        if (params) {
            params[param] = value
        }
        render()
    }
    function getElement(selector) {
        if (selector =="root") {
            return wrapper.DOMElement
        }else{
            return wrapper.DOMElement.querySelector(selector)
        }
        
    }

    function setData(newData) {
        params.data = newData
    }

    self.render = render
    self.set = set
    self.getElement = getElement
    self.remove = remove
    self.update = update
    self.setData = setData
    self.getLens = getLens

    self.addCSS = addCSS
    self.addLens = addLens
    self.createLens = createLens
    return self
}