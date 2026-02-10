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
let killCount = 0;
let killText;
let keys;
let lastFireTime = 0;
const FIRE_DELAY = 250; // 发射间隔（毫秒）

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理
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

  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 生成初始敌人
  for (let i = 0; i < 8; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 设置键盘输入
  keys = {
    W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  // 设置碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 创建击杀数文本
  killText = this.add.text(16, 16, 'Kills: 0', {
    fontSize: '32px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 添加说明文本
  this.add.text(16, 560, 'Press WASD to shoot', {
    fontSize: '20px',
    fill: '#aaaaaa',
    fontFamily: 'Arial'
  });
}

function update(time, delta) {
  // 检查发射子弹
  if (time > lastFireTime + FIRE_DELAY) {
    if (keys.W.isDown) {
      fireBullet(this, 0, -1);
      lastFireTime = time;
    } else if (keys.S.isDown) {
      fireBullet(this, 0, 1);
      lastFireTime = time;
    } else if (keys.A.isDown) {
      fireBullet(this, -1, 0);
      lastFireTime = time;
    } else if (keys.D.isDown) {
      fireBullet(this, 1, 0);
      lastFireTime = time;
    }
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
      bullet.destroy();
    }
  });

  // 如果敌人数量少于5个，补充新敌人
  if (enemies.countActive(true) < 5) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  }
}

function fireBullet(scene, dirX, dirY) {
  const bullet = bullets.get(player.x, player.y, 'bullet');
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    
    // 设置子弹速度
    bullet.setVelocity(dirX * 160, dirY * 160);
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.destroy();
  enemy.destroy();
  
  // 增加击杀数
  killCount++;
  killText.setText('Kills: ' + killCount);
  
  // 可验证的状态信号
  console.log('Kill count:', killCount);
}

const game = new Phaser.Game(config);