const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 生成粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFC0CB, 1); // 粉色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('pinkSquare', 32, 32);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建粉色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心点
    this.add.image(pointer.x, pointer.y, 'pinkSquare');
  });
}

new Phaser.Game(config);