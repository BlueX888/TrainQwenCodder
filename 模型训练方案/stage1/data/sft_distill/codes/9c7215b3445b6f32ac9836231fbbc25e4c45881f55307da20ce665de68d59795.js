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
  
  // 使用 Graphics 创建紫色椭圆纹理
  const graphics = this.add.graphics();
  
  // 绘制紫色椭圆
  graphics.fillStyle(0x9932cc, 1); // 深紫色
  graphics.fillEllipse(60, 40, 120, 80); // 中心点(60,40)，宽120，高80
  graphics.generateTexture('purpleEllipse', 120, 80);
  graphics.destroy();
  
  // 创建拖拽时使用的亮紫色椭圆纹理
  const graphicsDrag = this.add.graphics();
  graphicsDrag.fillStyle(0xda70d6, 1); // 亮紫色
  graphicsDrag.fillEllipse(60, 40, 120, 80);
  graphicsDrag.generateTexture('lightPurpleEllipse', 120, 80);
  graphicsDrag.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'purpleEllipse');
  
  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 添加鼠标悬停效果
  ellipse.on('pointerover', () => {
    ellipse.setScale(1.1);
  });
  
  ellipse.on('pointerout', () => {
    ellipse.setScale(1);
  });
  
  // 拖拽开始事件 - 改变颜色
  ellipse.on('dragstart', (pointer) => {
    ellipse.setTexture('lightPurpleEllipse');
    ellipse.setScale(1.1);
  });
  
  // 拖拽中事件 - 更新位置
  ellipse.on('drag', (pointer, dragX, dragY) => {
    ellipse.x = dragX;
    ellipse.y = dragY;
  });
  
  // 拖拽结束事件 - 恢复颜色和位置
  ellipse.on('dragend', (pointer) => {
    // 恢复原始颜色
    ellipse.setTexture('purpleEllipse');
    ellipse.setScale(1);
    
    // 使用补间动画平滑回到初始位置
    this.tweens.add({
      targets: ellipse,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '拖拽紫色椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);