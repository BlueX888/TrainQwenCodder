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
let enemies;
let bullets;
let cursors;
let killCount = 0;
let killText;
let lastFireTime = 0;
let fireRate = 300; // 发射间隔（毫秒）

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 创建敌人组
  enemies = this.physics.add.group({
    defaultKey: 'enemy'
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 创建击杀计数文本
  killText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 设置碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 定时生成敌人
  this.time.addEvent({
    delay: 2000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  // 初始生成几个敌人
  for (let i = 0; i < 3; i++) {
    spawnEnemy.call(this);
  }
}

function update(time, delta) {
  // 检测方向键并发射子弹
  if (time > lastFireTime + fireRate) {
    if (cursors.left.isDown) {
      fireBullet.call(this, -1, 0);
      lastFireTime = time;
    } else if (cursors.right.isDown) {
      fireBullet.call(this, 1, 0);
      lastFireTime = time;
    } else if (cursors.up.isDown) {
      fireBullet.call(this, 0, -1);
      lastFireTime = time;
    } else if (cursors.down.isDown) {
      fireBullet.call(this, 0, 1);
      lastFireTime = time;
    }
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    }
  });
}

function fireBullet(dirX, dirY) {
  // 从对象池获取或创建子弹
  let bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.reset(player.x, player.y);
    
    // 设置子弹速度
    bullet.setVelocity(dirX * 200, dirY * 200);
  }
}

function spawnEnemy() {
  // 随机位置生成敌人（避开中心玩家区域）
  let x, y;
  const edge = Phaser.Math.Between(0, 3);
  
  switch(edge) {
    case 0: // 上边
      x = Phaser.Math.Between(50, 750);
      y = 50;
      break;
    case 1: // 右边
      x = 750;
      y = Phaser.Math.Between(50, 550);
      break;
    case 2: // 下边
      x = Phaser.Math.Between(50, 750);
      y = 550;
      break;
    case 3: // 左边
      x = 50;
      y = Phaser.Math.Between(50, 550);
      break;
  }

  const enemy = enemies.create(x, y, 'enemy');
  
  // 让敌人缓慢移动向玩家
  this.physics.moveToObject(enemy, player, 50);
}

function hitEnemy(bullet, enemy) {
  // 子弹命中敌人
  bullet.setActive(false);
  bullet.setVisible(false);
  
  enemy.destroy();
  
  // 增加击杀数
  killCount++;
  killText.setText('Kills: ' + killCount);
  
  // 播放简单的视觉反馈
  const flash = this.add.graphics();
  flash.fillStyle(0xffffff, 0.5);
  flash.fillCircle(enemy.x, enemy.y, 20);
  this.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 200,
    onComplete: () => flash.destroy()
  });
}

// 启动游戏
const game = new Phaser.Game(config);