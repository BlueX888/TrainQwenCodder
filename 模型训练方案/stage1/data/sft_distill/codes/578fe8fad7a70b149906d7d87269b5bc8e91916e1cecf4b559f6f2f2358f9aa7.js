class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.playerHealth = 3;
    this.enemiesInWave = 0;
    this.enemiesKilled = 0;
    this.gameOver = false;
  }

  preload() {
    // 生成玩家纹理（三角形飞船）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色方块）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 生成子弹纹理（黄色圆形）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(16, 80, 'Health: 3', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  update(time, delta) {
    if (this.gameOver) return;

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
      this.shoot();
      this.lastFired = time;
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        this.checkWaveComplete();
      }
    });

    // 检查波次完成
    if (this.enemies.countActive(true) === 0 && this.enemiesKilled === this.enemiesInWave && !this.waveTransitioning) {
      this.waveTransitioning = true;
      this.time.delayedCall(2000, () => {
        this.startNextWave();
        this.waveTransitioning = false;
      });
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  startNextWave() {
    this.wave++;
    this.enemiesKilled = 0;
    this.enemiesInWave = 5 + (this.wave - 1);
    const enemySpeed = 200 + this.wave * 20;

    this.waveText.setText(`Wave: ${this.wave}`);

    // 生成敌人
    const spacing = 700 / this.enemiesInWave;
    for (let i = 0; i < this.enemiesInWave; i++) {
      const x = 50 + i * spacing;
      const y = -50 - i * 50; // 错开生成时间
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocityY(enemySpeed);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    this.kills++;
    this.enemiesKilled++;
    this.killsText.setText(`Kills: ${this.kills}`);

    this.checkWaveComplete();
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    this.playerHealth--;
    this.healthText.setText(`Health: ${this.playerHealth}`);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    if (this.playerHealth <= 0) {
      this.endGame();
    }
  }

  checkWaveComplete() {
    // 波次完成逻辑在 update 中处理
  }

  endGame() {
    this.gameOver = true;
    this.player.setActive(false);
    this.player.setVisible(false);
    
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) enemy.destroy();
    });

    this.gameOverText.setText(`GAME OVER\nWave: ${this.wave}\nKills: ${this.kills}`);
    
    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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