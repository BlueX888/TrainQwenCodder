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
let bullets;
let cursors;
let spaceKey;
let bulletsFired = 0; // 可验证的状态信号
let lastFiredTime = 0;
const fireRate = 250; // 发射间隔（毫秒）

function preload() {
  // 创建玩家纹理（三角形）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.beginPath();
  playerGraphics.moveTo(20, 0);
  playerGraphics.lineTo(-10, -10);
  playerGraphics.lineTo(-10, 10);
  playerGraphics.closePath();
  playerGraphics.fillPath();
  playerGraphics.generateTexture('player', 30, 20);
  playerGraphics.destroy();

  // 创建子弹纹理（小圆形）
  const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.95);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: true
  });

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加UI显示状态
  this.add.text(10, 10, 'Controls:', { 
    fontSize: '16px', 
    fill: '#fff' 
  });
  this.add.text(10, 30, 'Arrow Keys: Rotate', { 
    fontSize: '14px', 
    fill: '#aaa' 
  });
  this.add.text(10, 50, 'Space: Fire', { 
    fontSize: '14px', 
    fill: '#aaa' 
  });
  
  this.bulletCountText = this.add.text(10, 80, 'Bullets Fired: 0', { 
    fontSize: '16px', 
    fill: '#ffff00' 
  });
}

function update(time, delta) {
  // 旋转控制
  if (cursors.left.isDown) {
    player.angle -= 3;
  } else if (cursors.right.isDown) {
    player.angle += 3;
  }

  // 发射子弹
  if (Phaser.Input.Keyboard.JustDown(spaceKey) && time > lastFiredTime + fireRate) {
    fireBullet.call(this, time);
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      const bounds = this.physics.world.bounds;
      if (bullet.x < bounds.x - 20 || 
          bullet.x > bounds.x + bounds.width + 20 ||
          bullet.y < bounds.y - 20 || 
          bullet.y > bounds.y + bounds.height + 20) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    }
  });
}

function fireBullet(time) {
  // 获取或创建子弹
  let bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 计算子弹速度向量（基于玩家角度）
    const angleInRadians = Phaser.Math.DegToRad(player.angle);
    const velocityX = Math.cos(angleInRadians) * 200;
    const velocityY = Math.sin(angleInRadians) * 200;
    
    bullet.setVelocity(velocityX, velocityY);
    bullet.setRotation(angleInRadians);
    
    // 更新状态
    bulletsFired++;
    lastFiredTime = time;
    this.bulletCountText.setText('Bullets Fired: ' + bulletsFired);
  }
}

new Phaser.Game(config);