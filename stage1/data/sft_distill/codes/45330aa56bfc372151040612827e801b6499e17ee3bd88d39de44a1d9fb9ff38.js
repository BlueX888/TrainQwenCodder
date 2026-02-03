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

// 状态信号变量
let shotsFired = 0;
let activeBullets = 0;
let player;
let bullets;
let cursors;
let spaceKey;
let lastFireTime = 0;
const fireRate = 250; // 发射间隔（毫秒）

function preload() {
  // 使用 Graphics 生成玩家纹理（三角形表示朝向）
  const graphics = this.add.graphics();
  
  // 玩家纹理 - 三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(20, 0);
  graphics.lineTo(0, 15);
  graphics.lineTo(0, -15);
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('player', 20, 30);
  graphics.clear();
  
  // 子弹纹理 - 小圆形
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(4, 4, 4);
  graphics.generateTexture('bullet', 8, 8);
  graphics.clear();
  
  graphics.destroy();
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
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 显示提示文本
  this.add.text(10, 10, '方向键: 旋转玩家\n空格键: 发射子弹', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  // 显示状态信息
  this.statusText = this.add.text(10, 560, '', {
    fontSize: '16px',
    fill: '#00ff00'
  });
  
  updateStatusText.call(this);
}

function update(time, delta) {
  // 玩家旋转控制
  const rotationSpeed = 3; // 旋转速度（度/帧）
  
  if (cursors.left.isDown) {
    player.angle -= rotationSpeed;
  }
  
  if (cursors.right.isDown) {
    player.angle += rotationSpeed;
  }
  
  // 发射子弹
  if (Phaser.Input.Keyboard.JustDown(spaceKey) && time > lastFireTime + fireRate) {
    fireBullet.call(this);
    lastFireTime = time;
  }
  
  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
        bullet.setActive(false);
        bullet.setVisible(false);
        activeBullets--;
        updateStatusText.call(this);
      }
    }
  });
}

function fireBullet() {
  // 获取或创建子弹
  let bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 根据玩家朝向计算子弹速度
    const angleInRadians = Phaser.Math.DegToRad(player.angle);
    const velocityX = Math.cos(angleInRadians) * 300;
    const velocityY = Math.sin(angleInRadians) * 300;
    
    bullet.setVelocity(velocityX, velocityY);
    bullet.setRotation(angleInRadians);
    
    // 更新状态
    shotsFired++;
    activeBullets++;
    updateStatusText.call(this);
  }
}

function updateStatusText() {
  if (this.statusText) {
    this.statusText.setText(
      `发射次数: ${shotsFired} | 活跃子弹: ${activeBullets}`
    );
  }
}

// 启动游戏
new Phaser.Game(config);