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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建圆形精灵并设置到屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置为可交互和可拖拽
  circle.setInteractive({ draggable: true });

  // 监听拖拽开始事件 - 缩放到 1.2 倍
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setScale(1.2);
  });

  // 监听拖拽中事件 - 更新位置
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  // 监听拖拽结束事件 - 恢复原大小
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.setScale(1.0);
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽圆形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);