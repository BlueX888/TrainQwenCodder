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

let player;
let cursors;

function preload() {
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 设置世界边界为更大的区域，以便展示相机跟随
  this.physics.world.setBounds(0, 0, 2000, 2000);
  
  // 添加背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    graphics.lineBetween(x, 0, x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    graphics.lineBetween(0, y, 2000, y);
  }
  
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置玩家在世界边界内碰撞
  player.setCollideWorldBounds(true);
  
  // 设置玩家向右上方移动
  // x 方向速度为正（向右），y 方向速度为负（向上）
  player.setVelocity(150, -150);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 相机跟随玩家，保持玩家在屏幕中央
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 添加文本说明
  const text = this.add.text(10, 10, '相机跟随圆形移动', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 将文本固定在相机上，不随相机移动
  text.setScrollFactor(0);
  
  // 添加位置信息文本
  this.positionText = this.add.text(10, 50, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置信息显示
  this.positionText.setText([
    `圆形位置: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  ]);
  
  // 当圆形碰到世界边界时，反弹方向
  if (player.body.blocked.right || player.body.blocked.left) {
    player.setVelocityX(-player.body.velocity.x);
  }
  if (player.body.blocked.up || player.body.blocked.down) {
    player.setVelocityY(-player.body.velocity.y);
  }
}

new Phaser.Game(config);