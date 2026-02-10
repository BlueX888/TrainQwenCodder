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
  
  // 创建黄色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色菱形
  graphics.fillStyle(0xffff00, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 顶点
  graphics.lineTo(100, 50);  // 右点
  graphics.lineTo(50, 100);  // 底点
  graphics.lineTo(0, 50);    // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成黄色菱形纹理
  graphics.generateTexture('yellowDiamond', 100, 100);
  graphics.clear();
  
  // 绘制红色菱形纹理（拖拽时使用）
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成红色菱形纹理
  graphics.generateTexture('redDiamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(initialX, initialY, 'yellowDiamond');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', (pointer) => {
    // 改变为红色纹理
    diamond.setTexture('redDiamond');
    // 增加缩放效果
    diamond.setScale(1.1);
  });
  
  // 监听拖拽中事件
  diamond.on('drag', (pointer, dragX, dragY) => {
    // 更新菱形位置
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', (pointer) => {
    // 恢复缩放
    diamond.setScale(1);
    
    // 使用缓动动画回到初始位置
    this.tweens.add({
      targets: diamond,
      x: initialX,
      y: initialY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 动画完成后恢复黄色纹理
        diamond.setTexture('yellowDiamond');
      }
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽黄色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);