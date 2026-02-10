const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 64, 64);
  graphics.generateTexture('redSquare', 64, 64);
  graphics.destroy();
}

function create() {
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建红色方块
    // 使用 pointer.x 和 pointer.y 作为方块的中心点
    const square = this.add.image(pointer.x, pointer.y, 'redSquare');
    
    console.log(`Red square created at (${pointer.x}, ${pointer.y})`);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create red squares', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);