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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00aaff, 1);
  
  // 创建菱形路径（中心在 0,0）
  const size = 60;
  const path = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置交互和拖拽
  diamond.setInteractive();
  this.input.setDraggable(diamond);
  
  // 添加提示文本
  const text = this.add.text(400, 100, '拖拽菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
  
  // 监听拖拽开始事件
  diamond.on(Phaser.Input.Events.DRAG_START, (pointer, dragX, dragY) => {
    // 放大到 1.2 倍
    diamond.setScale(1.2);
  });
  
  // 监听拖拽中事件
  diamond.on(Phaser.Input.Events.DRAG, (pointer, dragX, dragY) => {
    // 更新位置
    diamond.x = dragX;
    diamond.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on(Phaser.Input.Events.DRAG_END, (pointer, dragX, dragY) => {
    // 恢复原始大小
    diamond.setScale(1);
  });
  
  // 添加鼠标悬停效果（可选）
  diamond.on(Phaser.Input.Events.GAMEOBJECT_OVER, () => {
    diamond.setTint(0xffff00);
  });
  
  diamond.on(Phaser.Input.Events.GAMEOBJECT_OUT, () => {
    diamond.clearTint();
  });
}

new Phaser.Game(config);