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

// 状态变量
let bulletsFired = 0;
let activeBullets = 0;

let player;
let bullets;
let spaceKey;
let lastFiredTime = 0;
const fireRate = 200; // 发射间隔（毫秒）

function preload() {
  // 创建粉色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(8, 8, 8); // 圆形子弹
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组（对象池）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加键盘移动控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加说明文字
  this.add.text(400, 50, '按空格键发射子弹\n方向键移动玩家', {
    fontSize: '20px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 玩家移动
  if (this.cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  if (this.cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (this.cursors.down.isDown) {
    player.setVelocityY(300);
  } else {
    player.setVelocityY(0);
  }

  // 发射子弹
  if (spaceKey.isDown && time > lastFiredTime + fireRate) {
    fireBullet.call(this);
    lastFiredTime = time;
  }

  // 检查子弹是否离开边界并回收
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      // 检查是否离开屏幕边界
      if (bullet.y < -50 || bullet.y > 650 || 
          bullet.x < -50 || bullet.x > 850) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        activeBullets--;
      }
    }
  });

  // 更新状态显示
  this.statusText.setText([
    `子弹发射总数: ${bulletsFired}`,
    `当前活跃子弹: ${activeBullets}`,
    `对象池大小: ${bullets.getLength()}`,
    `对象池使用: ${bullets.countActive(true)}/${bullets.maxSize}`
  ]);
}

function fireBullet() {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向上发射）
    bullet.body.velocity.y = -360;
    bullet.body.velocity.x = 0;
    
    // 更新状态
    bulletsFired++;
    activeBullets++;
  }
}

// 启动游戏
const game = new Phaser.Game(config);