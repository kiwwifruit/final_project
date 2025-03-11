document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const menuButton = document.getElementById("menu-button");
    let hideTimeout;

    // Toggle sidebar on menu button click
    menuButton.addEventListener("click", function () {
        sidebar.classList.toggle("active");
    });

    // Hide sidebar when mouse leaves for 3 seconds
    sidebar.addEventListener("mouseleave", function () {
        hideTimeout = setTimeout(() => {
            sidebar.classList.remove("active");
        }, 500); // Hide after 3 seconds
    });

    // Cancel hide if mouse re-enters sidebar
    sidebar.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeout);
    });

    const sidebarLinks = document.querySelectorAll("#sidebar a");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent default jump behavior

            const targetId = this.getAttribute("href").substring(1); // Get the target section ID
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Find the top position of the entire section box
                const boxTop = targetElement.getBoundingClientRect().top + window.scrollY;

                window.scrollTo({
                    top: boxTop - 50, // Adjusted to ensure full box is visible
                    behavior: "smooth"
                });
            }
        });
    });
});