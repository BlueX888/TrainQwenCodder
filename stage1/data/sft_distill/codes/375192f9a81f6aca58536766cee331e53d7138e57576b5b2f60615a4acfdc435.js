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
let bulletsActive = 0;

let bullets;
let spaceKey;
let player;
let lastFireTime = 0;
const fireRate = 200; // 发射间隔（毫秒）

function preload() {
  // 创建粉色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建玩家纹理（用于视觉参考）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1); // 绿色
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池（Physics Group）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 初始化子弹属性
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加说明文字
  this.add.text(16, 16, '按空格键发射子弹', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  // 添加状态显示
  this.statusText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#ffff00'
  });

  // 添加键盘控制（左右移动玩家）
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 更新状态显示
  bulletsActive = bullets.countActive(true);
  this.statusText.setText([
    `发射总数: ${bulletsFired}`,
    `活跃子弹: ${bulletsActive}`,
    `对象池容量: ${bullets.getLength()}`
  ]);

  // 玩家左右移动
  if (this.cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 检测空格键发射子弹
  if (spaceKey.isDown && time > lastFireTime + fireRate) {
    fireBullet.call(this);
    lastFireTime = time;
  }

  // 检查并回收离开边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      // 检查是否离开屏幕边界
      if (bullet.y < -20 || bullet.y > 620 || 
          bullet.x < -20 || bullet.x > 820) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
      }
    }
  });
}

function fireBullet() {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向上发射）
    bullet.body.velocity.y = -200;
    bullet.body.velocity.x = 0;
    
    // 更新统计
    bulletsFired++;
    
    console.log(`发射子弹 #${bulletsFired}，当前活跃: ${bullets.countActive(true)}`);
  }
}

// 启动游戏
const game = new Phaser.Game(config);