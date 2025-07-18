export function SideBarItem({text,icon}:
    {text:string,
    icon:React.ReactNode}
){
   
    return <div className="flex text-grey-800 cursor-pointer hover:bg-grey-100 rounded max-w-48 pl-4
    transition-all duration-1000">
        <div className="p-2">
        {icon}
        </div>
        <div className="p-2">
        {text}
        </div>
    </div>
}
