class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 8;
    this.enemySpeed = 120;
    this.isWaveActive = false;
    this.waveDelay = 2000; // 2秒延迟
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireDelay = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 更新UI
    this.updateUI();

    // 检查波次完成
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.onWaveComplete();
    }
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;
    this.statusText.setText('');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      const x = 100 + i * 80;
      const y = 100;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-this.enemySpeed, this.enemySpeed),
        Phaser.Math.Between(20, this.enemySpeed)
      );
      enemy.setBounce(1, 1);
      enemy.setCollideWorldBounds(true);
    }

    console.log(`Wave ${this.currentWave} started with ${this.enemiesPerWave} enemies`);
  }

  onWaveComplete() {
    this.isWaveActive = false;
    this.statusText.setText('Wave Complete! Next wave in 2s...');
    console.log(`Wave ${this.currentWave} completed`);

    // 2秒后开始下一波
    this.time.addEvent({
      delay: this.waveDelay,
      callback: this.startNextWave,
      callbackScope: this
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    console.log(`Enemy destroyed. Remaining: ${this.enemies.countActive(true)}`);
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}/${this.enemiesPerWave}`);
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

const game = new Phaser.Game(config);

// 导出状态用于验证
game.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    enemiesRemaining: scene.enemies.countActive(true),
    isWaveActive: scene.isWaveActive,
    totalEnemiesPerWave: scene.enemiesPerWave,
    enemySpeed: scene.enemySpeed
  };
};