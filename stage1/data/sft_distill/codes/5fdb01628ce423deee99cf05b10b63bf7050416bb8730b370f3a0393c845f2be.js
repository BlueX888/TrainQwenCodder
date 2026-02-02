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

let player;
let cursors;
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制一个指向上方的三角形
  // 三角形顶点坐标（相对于中心点）
  graphics.fillTriangle(
    16, 0,   // 顶部顶点
    0, 32,   // 左下顶点
    32, 32   // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 32, 32);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置精灵与世界边界碰撞
  player.setCollideWorldBounds(true);
  
  // 设置物理世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  // 避免对角线移动速度过快
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * Math.SQRT1_2,
      player.body.velocity.y * Math.SQRT1_2
    );
  }
}

// 启动游戏
new Phaser.Game(config);