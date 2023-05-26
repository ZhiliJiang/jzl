var flag=1;
var mobile=document.getElementsByClassName("mobile");

function change() {
	if(flag){
    	mobile[0].style.display="flex";
    	flag=0;
	}
	else{
		mobile[0].style.display="none";
		flag=1;
	}
}
var p=document.getElementById('p');
var menu=document.getElementById('menu');
var q=document.getElementById('q');
var hide=document.getElementById('hide');
q.addEventListener('click',qclick);
var flag=1;
function qclick(e){
    console.log(1);
    if(flag==1){
        flag=0;
        hide.style.display="flex";
    }else{
        flag=1;
        hide.style.display="none";
    }
}  
