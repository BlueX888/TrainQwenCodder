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
let enemies;
let keys;
let killCount = 0;
let killText;
let lastFireTime = 0;
const FIRE_RATE = 200; // 发射间隔（毫秒）
const BULLET_SPEED = 360;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建子弹纹理
  const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 30, 30);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
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

  // 生成初始敌人
  spawnEnemies.call(this, 10);

  // 设置WASD键
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 创建击杀数文本
  killText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
  killText.setDepth(100);

  // 设置碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 添加提示文本
  this.add.text(400, 550, 'Press WASD to shoot', {
    fontSize: '18px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 检测WASD键发射子弹
  if (time > lastFireTime + FIRE_RATE) {
    if (keys.W.isDown) {
      fireBullet.call(this, 0, -1); // 向上
      lastFireTime = time;
    } else if (keys.S.isDown) {
      fireBullet.call(this, 0, 1); // 向下
      lastFireTime = time;
    } else if (keys.A.isDown) {
      fireBullet.call(this, -1, 0); // 向左
      lastFireTime = time;
    } else if (keys.D.isDown) {
      fireBullet.call(this, 1, 0); // 向右
      lastFireTime = time;
    }
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    }
  });

  // 如果敌人数量少于5个，补充新敌人
  if (enemies.countActive(true) < 5) {
    spawnEnemies.call(this, 3);
  }
}

function fireBullet(dirX, dirY) {
  // 从对象池获取或创建子弹
  let bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.reset(player.x, player.y);
    
    // 设置子弹速度
    bullet.setVelocity(dirX * BULLET_SPEED, dirY * BULLET_SPEED);
  }
}

function spawnEnemies(count) {
  for (let i = 0; i < count; i++) {
    // 随机位置，但避开玩家附近
    let x, y;
    do {
      x = Phaser.Math.Between(50, 750);
      y = Phaser.Math.Between(50, 550);
    } while (Phaser.Math.Distance.Between(x, y, player.x, player.y) < 150);

    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.setActive(false);
  bullet.setVisible(false);
  enemy.destroy();

  // 增加击杀数
  killCount++;
  killText.setText('Kills: ' + killCount);

  // 验证状态信号
  console.log('Kill count:', killCount);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getKillCount: () => killCount };
}