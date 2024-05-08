function toggleSidebar() {
    var sidebar = document.getElementById("mySidebar");
    var main = document.getElementById("main");
    var toggleButton = document.getElementById("sidebarToggle");

    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
        main.style.marginLeft = "0";
        toggleButton.style.marginLeft = "0"; // Adjust button's margin
        toggleButton.textContent = "\u2630"; // Unicode for hamburger icon
    } else {
        sidebar.style.width = "250px";
        main.style.marginLeft = "250px";
        toggleButton.style.marginLeft = "250px"; // Adjust button's margin
        toggleButton.textContent = "\u2715"; // Unicode for close icon
    }
}