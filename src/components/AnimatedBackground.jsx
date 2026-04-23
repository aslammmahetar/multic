import { useEffect } from "react";

const AnimatedBackground = () => {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";

    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const numStars = 200;
    const galaxies = [];
    const shockwaves = [];
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let bgShift = 0;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        alpha: Math.random(),
        delta: Math.random() * 0.02,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        layer: Math.random() * 3 + 1,
        shapeShift: Math.random() > 0.9,
        color: `rgba(${200 + Math.random() * 55}, ${
          200 + Math.random() * 55
        }, 255, 1)`,
      });
    }

    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    document.addEventListener("click", (event) => {
      shockwaves.push({
        x: event.clientX,
        y: event.clientY,
        radius: 10,
        alpha: 1,
      });
    });

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bgShift += 0.0002;

      let gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, `rgb(${30 + Math.sin(bgShift) * 10}, 10, 20)`);
      gradient.addColorStop(0.5, "#0A0A1E");
      gradient.addColorStop(1, `rgb(5, 5, ${40 + Math.sin(bgShift) * 10})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.alpha += star.delta;
        if (star.alpha >= 1 || star.alpha <= 0) star.delta *= -1;

        let dx = (mouseX - canvas.width / 2) * 0.001 * star.layer;
        let dy = (mouseY - canvas.height / 2) * 0.001 * star.layer;

        star.x += star.speedX + dx;
        star.y += star.speedY + dy;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        if (star.shapeShift) {
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - star.radius);
          ctx.lineTo(star.x + star.radius * 0.6, star.y + star.radius * 0.6);
          ctx.lineTo(star.x - star.radius * 0.6, star.y + star.radius * 0.6);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.fill();
        }
      });

      shockwaves.forEach((wave, index) => {
        wave.radius += 5;
        wave.alpha -= 0.02;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${wave.alpha})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "white";
        ctx.stroke();
        if (wave.alpha <= 0) shockwaves.splice(index, 1);
      });
    };

    const animate = () => {
      drawStars();
      requestAnimationFrame(animate);
    };

    animate();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, []);

  return null;
};

export default AnimatedBackground;
