const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let rectangle;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFC0CB, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkRect', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  rectangle = this.physics.add.sprite(400, 300, 'pinkRect');
  
  // 设置初始速度（80速度，方向为右下45度）
  rectangle.setVelocity(80, 80);
  
  // 设置碰撞世界边界
  rectangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美反弹
  rectangle.setBounce(1, 1);
}

function update(time, delta) {
  // Arcade 物理系统会自动处理边界反弹
  // 不需要手动更新
}

new Phaser.Game(config);