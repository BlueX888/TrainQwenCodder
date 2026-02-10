class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.baseEnemyCount = 10;
    this.baseEnemySpeed = 160;
    this.enemiesAlive = 0;
    this.isGameOver = false;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(0, -20, -15, 15, 15, 15);
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillTriangle(0, 20, -12, -12, 12, -12);
    enemyGraphics.generateTexture('enemy', 24, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(-2, -5, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    Phaser.Math.RND.sow([this.seed]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 100
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 300; // 毫秒

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);

    // 初始化信号
    window.__signals__ = {
      wave: 0,
      kills: 0,
      enemiesAlive: 0,
      isGameOver: false,
      enemySpeed: this.baseEnemySpeed
    };

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireRate) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 检查敌人是否到达底部
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 600) {
        this.gameOver();
      }
    });

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否所有敌人被消灭
    if (this.enemiesAlive === 0 && !this.isGameOver) {
      this.startNextWave();
    }

    // 更新信号
    this.updateSignals();
  }

  startNextWave() {
    this.wave++;
    const enemyCount = this.baseEnemyCount + (this.wave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.wave - 1) * 10;

    this.waveText.setText(`Wave: ${this.wave}`);
    this.statusText.setText(`Wave ${this.wave} Starting!`);

    // 延迟清除状态文本
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });

    // 生成敌人
    this.enemiesAlive = enemyCount;
    const spawnDelay = 500; // 每个敌人生成间隔

    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * spawnDelay, () => {
        this.spawnEnemy(enemySpeed);
      });
    }

    console.log(JSON.stringify({
      event: 'wave_start',
      wave: this.wave,
      enemyCount: enemyCount,
      enemySpeed: enemySpeed,
      timestamp: Date.now()
    }));
  }

  spawnEnemy(speed) {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -30, 'enemy');

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      enemy.body.setSize(24, 32);
    }
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      bullet.body.setSize(4, 10);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);

    this.kills++;
    this.enemiesAlive--;
    this.killsText.setText(`Kills: ${this.kills}`);

    console.log(JSON.stringify({
      event: 'enemy_killed',
      kills: this.kills,
      enemiesAlive: this.enemiesAlive,
      wave: this.wave,
      timestamp: Date.now()
    }));
  }

  gameOver() {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.statusText.setText('GAME OVER');

    // 停止所有物理对象
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        enemy.setVelocity(0, 0);
      }
    });

    this.player.setVelocity(0, 0);
    this.player.setTint(0xff0000);

    console.log(JSON.stringify({
      event: 'game_over',
      wave: this.wave,
      kills: this.kills,
      timestamp: Date.now()
    }));

    this.updateSignals();
  }

  updateSignals() {
    window.__signals__ = {
      wave: this.wave,
      kills: this.kills,
      enemiesAlive: this.enemiesAlive,
      isGameOver: this.isGameOver,
      enemySpeed: this.baseEnemySpeed + (this.wave - 1) * 10,
      totalEnemiesSpawned: this.baseEnemyCount + (this.wave - 1)
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
  scene: EndlessWaveScene
};

new Phaser.Game(config);