class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    this.wave = 0;
    this.kills = 0;
    this.enemiesInWave = 0;
    this.enemiesSpawned = 0;
    this.baseEnemySpeed = 80;
    this.isWaveActive = false;
    this.gameOver = false;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色三角形
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 15);
    playerGraphics.lineTo(15, 15);
    playerGraphics.closePath();
    playerGraphics.fill();
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 敌人纹理 - 红色圆形
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.lineStyle(2, 0xaa0000, 1);
    enemyGraphics.strokeCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 子弹纹理 - 黄色小圆
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.health = 3;

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D')
    };

    // 鼠标射击
    this.input.on('pointerdown', (pointer) => {
      if (!this.gameOver) {
        this.shootBullet(pointer);
      }
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHitEnemy,
      null,
      this
    );

    // UI文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.killsText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.healthText = this.add.text(16, 80, 'Health: 3', {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.wave++;
    this.enemiesInWave = 2 + this.wave; // 从3个开始（wave 1 = 3个敌人）
    this.enemiesSpawned = 0;
    this.isWaveActive = true;

    this.waveText.setText(`Wave: ${this.wave}`);
    this.statusText.setText(`Wave ${this.wave} Starting!`);
    this.statusText.setAlpha(1);

    // 淡出状态文本
    this.tweens.add({
      targets: this.statusText,
      alpha: 0,
      duration: 2000,
      delay: 1000
    });

    // 开始生成敌人
    this.spawnEnemiesForWave();
  }

  spawnEnemiesForWave() {
    // 每隔一段时间生成一个敌人
    const spawnDelay = 1000; // 每秒生成一个
    
    this.time.addEvent({
      delay: spawnDelay,
      callback: () => {
        if (this.enemiesSpawned < this.enemiesInWave && !this.gameOver) {
          this.spawnEnemy();
          this.enemiesSpawned++;
        }
      },
      repeat: this.enemiesInWave - 1
    });
  }

  spawnEnemy() {
    // 随机从屏幕边缘生成
    const side = Phaser.Math.Between(0, 3); // 0上 1右 2下 3左
    let x, y;

    switch(side) {
      case 0: // 上
        x = Phaser.Math.Between(50, 750);
        y = -30;
        break;
      case 1: // 右
        x = 830;
        y = Phaser.Math.Between(50, 550);
        break;
      case 2: // 下
        x = Phaser.Math.Between(50, 750);
        y = 630;
        break;
      case 3: // 左
        x = -30;
        y = Phaser.Math.Between(50, 550);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(false);
    
    // 速度随波次递增
    const speedMultiplier = 1 + (this.wave - 1) * 0.15;
    enemy.speed = this.baseEnemySpeed * speedMultiplier;
  }

  shootBullet(pointer) {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      const speed = 400;
      bullet.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 子弹生命周期
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      });
    }
  }

  bulletHitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    enemy.destroy();

    // 增加击杀数
    this.kills++;
    this.killsText.setText(`Kills: ${this.kills}`);

    // 检查波次是否完成
    this.checkWaveComplete();
  }

  playerHitEnemy(player, enemy) {
    enemy.destroy();

    // 减少生命值
    this.player.health--;
    this.healthText.setText(`Health: ${this.player.health}`);

    // 更新生命值颜色
    if (this.player.health === 2) {
      this.healthText.setFill('#ffff00');
    } else if (this.player.health === 1) {
      this.healthText.setFill('#ff0000');
    }

    // 玩家闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    if (this.player.health <= 0) {
      this.endGame();
    }
  }

  checkWaveComplete() {
    // 检查是否所有敌人都已生成且被消灭
    if (this.enemiesSpawned >= this.enemiesInWave && 
        this.enemies.countActive(true) === 0 && 
        this.isWaveActive) {
      
      this.isWaveActive = false;
      this.statusText.setText(`Wave ${this.wave} Complete!`);
      this.statusText.setAlpha(1);

      // 延迟开始下一波
      this.time.delayedCall(3000, () => {
        if (!this.gameOver) {
          this.startNextWave();
        }
      });
    }
  }

  endGame() {
    this.gameOver = true;
    this.isWaveActive = false;

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    this.statusText.setText(`GAME OVER\nWave: ${this.wave}\nKills: ${this.kills}`);
    this.statusText.setAlpha(1);
    this.statusText.setFontSize('36px');

    // 添加重启提示
    this.add.text(400, 400, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        const angle = Phaser.Math.Angle.Between(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );

        enemy.setVelocity(
          Math.cos(angle) * enemy.speed,
          Math.sin(angle) * enemy.speed
        );

        // 移除超出边界的敌人
        if (enemy.x < -50 || enemy.x > 850 || 
            enemy.y < -50 || enemy.y > 650) {
          enemy.destroy();
        }
      }
    });

    // 移除超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && 
          (bullet.x < -20 || bullet.x > 820 || 
           bullet.y < -20 || bullet.y > 620)) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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