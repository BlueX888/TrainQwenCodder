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
  // 使用 Graphics 生成绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillCircle(16, 16, 16); // 在 (16,16) 位置绘制半径为 16 的圆
  graphics.generateTexture('greenCircle', 32, 32); // 生成 32x32 的纹理
  graphics.destroy(); // 销毁 graphics 对象，释放内存

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建绿色圆形
    const circle = this.add.sprite(pointer.x, pointer.y, 'greenCircle');
  });

  // 添加提示文本
  this.add.text(400, 20, 'Click anywhere to create green circles', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);