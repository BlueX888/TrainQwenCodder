class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 0;
    this.killCount = 0;
    this.enemiesRemaining = 0;
    this.baseSpeed = 240;
    this.baseEnemyCount = 12;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 20, 15, 20);
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    this.rng = this.createSeededRandom(this.seed);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理越界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理越界的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 610) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.updateUI();
        this.checkWaveComplete();
      }
    });
  }

  startNextWave() {
    this.wave++;
    const enemyCount = this.baseEnemyCount + (this.wave - 1);
    const enemySpeed = this.baseSpeed + (this.wave - 1) * 10;
    
    this.enemiesRemaining = enemyCount;
    this.updateUI();

    // 显示波次开始提示
    this.statusText.setText(`Wave ${this.wave} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 分批生成敌人
    const spawnInterval = 1000;
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * spawnInterval, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    const x = this.rng() * 760 + 20; // 20-780之间随机位置
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(speed);
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.killCount++;
    this.enemiesRemaining--;
    this.updateUI();
    this.checkWaveComplete();
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.enemiesRemaining--;
    this.updateUI();
    
    // 简单的闪烁效果
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });
    
    this.checkWaveComplete();
  }

  checkWaveComplete() {
    if (this.enemiesRemaining <= 0) {
      // 波次完成，延迟2秒开始下一波
      this.statusText.setText(`Wave ${this.wave} Complete!`);
      this.time.delayedCall(2000, () => {
        this.startNextWave();
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave}`);
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
  }

  // 创建带种子的随机数生成器
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);