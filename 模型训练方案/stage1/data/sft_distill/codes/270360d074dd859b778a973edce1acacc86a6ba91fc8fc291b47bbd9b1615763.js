const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 记录初始位置
  const initialX = 400;
  const initialY = 300;
  
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  
  // 绘制白色六边形
  function drawHexagon(graphics, color) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.lineStyle(3, 0x000000, 1);
    
    const size = 50;
    const points = [];
    
    // 计算六边形的六个顶点
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = size + size * Math.cos(angle);
      const y = size + size * Math.sin(angle);
      points.push(x, y);
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      graphics.lineTo(points[i], points[i + 1]);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }
  
  // 绘制白色六边形并生成纹理
  drawHexagon(graphics, 0xffffff);
  graphics.generateTexture('hexagon_white', 100, 100);
  
  // 绘制黄色六边形并生成纹理
  drawHexagon(graphics, 0xffff00);
  graphics.generateTexture('hexagon_yellow', 100, 100);
  
  // 清除 graphics（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagon_white');
  
  // 设置为可交互
  hexagon.setInteractive();
  
  // 设置为可拖拽
  this.input.setDraggable(hexagon);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', (pointer) => {
    // 拖拽开始时改变为黄色
    hexagon.setTexture('hexagon_yellow');
  });
  
  // 监听拖拽事件
  hexagon.on('drag', (pointer, dragX, dragY) => {
    // 更新六边形位置跟随鼠标
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', (pointer) => {
    // 恢复白色
    hexagon.setTexture('hexagon_white');
    
    // 使用缓动动画回到初始位置
    this.tweens.add({
      targets: hexagon,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);