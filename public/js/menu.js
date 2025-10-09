function createTreeStructure(data) {
    let map = {}, node, roots = [], i;

    // First map the nodes of the array to an object -> create a hash table.
    for (i = 2; i < data.length; i += 1) {
        map[`${data[i].ind}`] = parseInt(data[i].ind); // Initialize the map

        data[i].children = []; // Initialize the children

    }

    for (i = 2; i < data.length; i += 1) {
        try {
            node = data[i];
            parent = parseInt(node.par);
            ind = parseInt(node.ind);
            if (parent === 1) {
                roots[`ind${ind}`] = node;
            }
            if (parent > 2) {
                //  console.log(roots);

                roots[`ind${parent}`].children.push(node);
            }
        }
        catch {
            // console.log(err);
        }
    }

    return roots;
}

function createMenu(data) {
    let menu = document.getElementById('accordionSidebar');
    let menuItems = createTreeStructure(data);
    console.log(menuItems);
    for (var key in menuItems) {

        let menuItem = menuItems[key];

        if (menuItem.groupe === "assmedia" && menuItem.children.length > 0) {
            console.log(menuItem);
            let li = document.createElement('li');
            li.className = 'nav-item';
            let a = document.createElement('a');
            a.className = 'nav-link collapsed';
            a.href = '#';
            a.setAttribute('data-toggle', 'collapse');
            a.setAttribute('data-target', '#collapse' + menuItem.ind);
            a.setAttribute('aria-expanded', 'true');
            a.setAttribute('aria-controls', 'collapse' + menuItem.ind);
            let i1 = document.createElement('i');
            i1.className = 'fas fa-fw fa-cog';
            let span = document.createElement('span');
            span.innerText = menuItem.desi;
            a.appendChild(i1);
            a.appendChild(span);
            li.appendChild(a);
            let div = document.createElement('div');
            div.id = 'collapse' + menuItem.ind;
            div.className = 'collapse';
            div.setAttribute('aria-labelledby', 'heading' + menuItem.ind);
            div.setAttribute('data-parent', '#accordionSidebar');
            let div2 = document.createElement('div');
            div2.className = 'bg-white py-2 collapse-inner rounded';
            for (var subkey in menuItem.children) {
                let menuItem2 = menuItem.children[subkey];
                //   console.log(menuItem2);
                let a2 = document.createElement('a');
                a2.className = 'collapse-item';
                a2.href = menuItem2.prog;
                a2.onclick = function (e) {
                    e.preventDefault();
                    console.log(`Clicked on ${menuItem2.prog}`);
                    loadFormData(menuItem2.prog, document.getElementById("mainDivContent"));
                }
                if (menuItem2.desi.length < 19)
                    a2.innerText = menuItem2.desi;
                else
                    a2.innerText = menuItem2.desi.substring(0, 20) + "..";
                div2.appendChild(a2);
            }
            div.appendChild(div2);
            li.appendChild(div);
            menu.appendChild(li);
        }
    }
}
