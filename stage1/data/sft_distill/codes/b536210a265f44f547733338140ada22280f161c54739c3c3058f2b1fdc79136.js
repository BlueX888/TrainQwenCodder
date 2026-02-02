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
  
  // 使用 Graphics 绘制蓝色六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色六边形
  function drawHexagon(graphics, color) {
    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.lineStyle(3, 0xffffff, 1);
    
    const radius = 60;
    const sides = 6;
    const angle = (Math.PI * 2) / sides;
    
    graphics.beginPath();
    for (let i = 0; i < sides; i++) {
      const x = radius * Math.cos(angle * i - Math.PI / 2);
      const y = radius * Math.sin(angle * i - Math.PI / 2);
      if (i === 0) {
        graphics.moveTo(x + 64, y + 64);
      } else {
        graphics.lineTo(x + 64, y + 64);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }
  
  // 生成蓝色六边形纹理
  drawHexagon(graphics, 0x4a90e2);
  graphics.generateTexture('hexagonBlue', 128, 128);
  
  // 生成橙色六边形纹理（拖拽时使用）
  drawHexagon(graphics, 0xff8c42);
  graphics.generateTexture('hexagonOrange', 128, 128);
  
  // 清理 graphics
  graphics.destroy();
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(initialX, initialY, 'hexagonBlue');
  
  // 设置为可交互
  hexagon.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽六边形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 监听拖拽开始事件
  hexagon.on('dragstart', (pointer) => {
    // 改变为橙色
    hexagon.setTexture('hexagonOrange');
    // 放大效果
    hexagon.setScale(1.1);
    hintText.setText('正在拖拽...');
  });
  
  // 监听拖拽事件
  hexagon.on('drag', (pointer, dragX, dragY) => {
    // 更新六边形位置
    hexagon.x = dragX;
    hexagon.y = dragY;
  });
  
  // 监听拖拽结束事件
  hexagon.on('dragend', (pointer) => {
    // 恢复蓝色
    hexagon.setTexture('hexagonBlue');
    // 恢复原始大小
    hexagon.setScale(1);
    
    // 使用 tween 动画回到初始位置
    this.tweens.add({
      targets: hexagon,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        hintText.setText('拖拽六边形试试！');
      }
    });
  });
  
  // 添加鼠标悬停效果
  hexagon.on('pointerover', () => {
    hexagon.setScale(1.05);
  });
  
  hexagon.on('pointerout', () => {
    if (!hexagon.input.isDragging) {
      hexagon.setScale(1);
    }
  });
}

new Phaser.Game(config);