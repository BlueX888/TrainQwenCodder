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
  // 使用 Graphics 生成绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillCircle(16, 16, 16); // 在32x32画布中心绘制半径16的圆
  graphics.generateTexture('greenCircle', 32, 32);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
}

function create() {
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create green circles', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建绿色圆形
    this.add.image(pointer.x, pointer.y, 'greenCircle');
  });
}

new Phaser.Game(config);