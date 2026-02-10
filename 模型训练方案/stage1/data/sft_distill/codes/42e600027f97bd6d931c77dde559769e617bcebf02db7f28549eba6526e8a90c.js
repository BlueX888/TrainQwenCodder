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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillEllipse(60, 40, 120, 80); // 中心点(60, 40)，宽120，高80
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵并设置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 设置为可交互和可拖拽
  ellipse.setInteractive({ draggable: true });
  
  // 添加提示文本
  const hintText = this.add.text(400, 50, '拖拽椭圆试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  hintText.setOrigin(0.5);
  
  // 监听拖拽开始事件
  ellipse.on('dragstart', function(pointer) {
    // 拖拽时放大到 1.2 倍
    this.setScale(1.2);
    // 提升层级，确保在最上层
    this.setDepth(1);
  });
  
  // 监听拖拽中事件
  ellipse.on('drag', function(pointer, dragX, dragY) {
    // 更新椭圆位置跟随鼠标
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  ellipse.on('dragend', function(pointer) {
    // 恢复原始大小
    this.setScale(1);
    // 恢复默认层级
    this.setDepth(0);
  });
  
  // 添加悬停效果（可选）
  ellipse.on('pointerover', function() {
    if (this.scaleX === 1) { // 只在非拖拽状态下显示悬停效果
      this.setTint(0xffff00);
    }
  });
  
  ellipse.on('pointerout', function() {
    this.clearTint();
  });
}

new Phaser.Game(config);