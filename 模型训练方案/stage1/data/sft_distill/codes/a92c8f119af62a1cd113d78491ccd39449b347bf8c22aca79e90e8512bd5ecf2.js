const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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

let square;
let velocity = { x: 200, y: 200 };

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 生成粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'pinkSquare');
  
  // 设置初始速度
  square.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

function update(time, delta) {
  // arcade 物理引擎的 collideWorldBounds 和 bounce 会自动处理反弹
  // 无需手动编写边界检测代码
}

new Phaser.Game(config);