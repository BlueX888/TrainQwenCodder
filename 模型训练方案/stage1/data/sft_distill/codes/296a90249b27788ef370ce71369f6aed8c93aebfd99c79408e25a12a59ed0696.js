const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 生成灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 24, 24); // 24x24 像素矩形
  graphics.generateTexture('grayRect', 24, 24);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建灰色矩形
    // 设置原点为中心，使矩形中心对齐点击位置
    const rect = this.add.image(pointer.x, pointer.y, 'grayRect');
    rect.setOrigin(0.5, 0.5);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create gray rectangles', {
    fontSize: '16px',
    color: '#000000'
  });
}

new Phaser.Game(config);