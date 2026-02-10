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
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillEllipse(60, 40, 120, 80); // 绘制椭圆（中心点，宽度，高度）
  graphics.generateTexture('purpleEllipse', 120, 80);
  graphics.destroy();
  
  // 创建亮紫色椭圆纹理（拖拽时使用）
  const graphicsDrag = this.add.graphics();
  graphicsDrag.fillStyle(0xc39bd3, 1); // 亮紫色
  graphicsDrag.fillEllipse(60, 40, 120, 80);
  graphicsDrag.generateTexture('lightPurpleEllipse', 120, 80);
  graphicsDrag.destroy();
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(initialX, initialY, 'purpleEllipse');
  
  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  ellipse.on('dragstart', (pointer) => {
    // 改变为亮紫色
    ellipse.setTexture('lightPurpleEllipse');
    // 可选：增加缩放效果
    ellipse.setScale(1.1);
  });
  
  // 监听拖拽中事件
  ellipse.on('drag', (pointer, dragX, dragY) => {
    // 更新椭圆位置跟随鼠标
    ellipse.x = dragX;
    ellipse.y = dragY;
  });
  
  // 监听拖拽结束事件
  ellipse.on('dragend', (pointer) => {
    // 恢复原始颜色
    ellipse.setTexture('purpleEllipse');
    // 恢复原始缩放
    ellipse.setScale(1);
    
    // 使用补间动画平滑返回初始位置
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
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);