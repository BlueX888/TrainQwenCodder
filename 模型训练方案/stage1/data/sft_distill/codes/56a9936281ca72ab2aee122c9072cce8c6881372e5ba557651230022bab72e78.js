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
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 80, 80);
  
  // 生成纹理并命名为 'orangeSquare'
  graphics.generateTexture('orangeSquare', 80, 80);
  
  // 销毁 graphics 对象，因为纹理已生成
  graphics.destroy();
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建橙色方块
    // 方块中心对齐点击位置
    this.add.image(pointer.x, pointer.y, 'orangeSquare');
  });
  
  // 添加提示文字
  const style = {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial'
  };
  this.add.text(10, 10, 'Click anywhere to create orange squares', style);
}

new Phaser.Game(config);