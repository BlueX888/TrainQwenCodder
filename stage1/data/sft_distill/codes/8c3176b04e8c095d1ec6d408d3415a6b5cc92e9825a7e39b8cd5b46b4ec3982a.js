class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.enemiesAlive = 0;
    this.baseEnemySpeed = 300;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标射击
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer);
    });

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.killsText = this.add.text(16, 50, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemiesText = this.add.text(16, 84, 'Enemies: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 状态信号（用于验证）
    this.gameState = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      playerAlive: true
    };

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    if (!this.player.active) return;

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach((enemy) => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, enemy.getData('speed'));
      }
    });

    // 检查波次是否完成
    if (this.enemiesAlive === 0 && this.wave > 0) {
      this.startNextWave();
    }
  }

  startNextWave() {
    this.wave++;
    const enemyCount = 8 + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 20;

    this.waveText.setText(`Wave: ${this.wave}`);
    this.gameState.wave = this.wave;

    // 延迟生成敌人
    this.time.delayedCall(1000, () => {
      for (let i = 0; i < enemyCount; i++) {
        this.time.delayedCall(i * 200, () => {
          this.spawnEnemy(enemySpeed);
        });
      }
    });
  }

  spawnEnemy(speed) {
    // 随机生成位置（屏幕边缘）
    const side = this.rng.between(0, 3);
    let x, y;

    switch (side) {
      case 0: // 上
        x = this.rng.between(0, 800);
        y = -20;
        break;
      case 1: // 右
        x = 820;
        y = this.rng.between(0, 600);
        break;
      case 2: // 下
        x = this.rng.between(0, 800);
        y = 620;
        break;
      case 3: // 左
        x = -20;
        y = this.rng.between(0, 600);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setData('speed', speed);
    this.enemiesAlive++;
    this.updateEnemiesText();
    this.gameState.enemiesAlive = this.enemiesAlive;
  }

  shootBullet(pointer) {
    if (!this.player.active) return;

    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算子弹方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      this.physics.velocityFromRotation(angle, 600, bullet.body.velocity);

      // 子弹生命周期
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    this.kills++;
    this.enemiesAlive--;
    this.killsText.setText(`Kills: ${this.kills}`);
    this.updateEnemiesText();

    this.gameState.kills = this.kills;
    this.gameState.enemiesAlive = this.enemiesAlive;
  }

  playerHitEnemy(player, enemy) {
    // 游戏结束
    player.setActive(false);
    player.setVisible(false);
    this.gameState.playerAlive = false;

    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);

    const statsText = this.add.text(400, 380, 
      `Wave: ${this.wave}\nKills: ${this.kills}`, {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 },
      align: 'center'
    });
    statsText.setOrigin(0.5);
  }

  updateEnemiesText() {
    this.enemiesText.setText(`Enemies: ${this.enemiesAlive}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: EndlessWaveScene
};

new Phaser.Game(config);