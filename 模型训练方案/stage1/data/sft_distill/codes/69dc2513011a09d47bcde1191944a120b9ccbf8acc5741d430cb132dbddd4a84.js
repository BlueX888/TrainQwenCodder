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
  },
  backgroundColor: '#2d2d2d'
};

let rectangle;
let velocityX = 200;
let velocityY = 200;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 60, 40);
  graphics.generateTexture('orangeRect', 60, 40);
  graphics.destroy();

  // 创建物理精灵
  rectangle = this.physics.add.sprite(400, 300, 'orangeRect');
  
  // 设置初始速度
  rectangle.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  rectangle.setCollideWorldBounds(true);
  
  // 设置反弹系数
  rectangle.setBounce(1, 1);
  
  // 确保物理体大小与纹理匹配
  rectangle.body.setSize(60, 40);
}

function update(time, delta) {
  // Arcade 物理系统的 bounce 和 collideWorldBounds 会自动处理反弹
  // 不需要手动检测边界
}

new Phaser.Game(config);