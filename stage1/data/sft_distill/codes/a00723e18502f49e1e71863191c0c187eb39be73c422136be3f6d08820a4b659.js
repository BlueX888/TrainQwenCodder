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
  // 使用 Graphics 生成 48x48 蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 48, 48);
  graphics.generateTexture('blueSquare', 48, 48);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建蓝色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心位置
    const square = this.add.image(pointer.x, pointer.y, 'blueSquare');
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create blue squares', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);