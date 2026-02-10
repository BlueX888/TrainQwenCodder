class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 0;
    this.enemiesPerWave = 10;
    this.enemySpeed = 360;
    this.totalKills = 0;
    this.isWaveActive = false;
    this.waveTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI 文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.killsText = this.add.text(16, 84, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 开始第一波
    this.startNextWave();
  }

  startNextWave() {
    this.currentWave++;
    this.isWaveActive = true;

    // 显示波次开始信息
    this.statusText.setText(`Wave ${this.currentWave} Start!`);
    this.time.delayedCall(1500, () => {
      this.statusText.setText('');
    });

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnEnemy();
      });
    }

    this.updateUI();
  }

  spawnEnemy() {
    // 随机位置（顶部）
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置速度（向下移动）
    enemy.setVelocityY(this.enemySpeed);
    
    // 添加随机水平移动
    const horizontalSpeed = Phaser.Math.Between(-100, 100);
    enemy.setVelocityX(horizontalSpeed);
    
    // 设置边界反弹
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(1, 0);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.totalKills++;
    
    this.updateUI();

    // 检查是否消灭了所有敌人
    if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.onWaveComplete();
    }
  }

  hitPlayer(player, enemy) {
    enemy.destroy();
    // 简单的击退效果
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
    
    this.time.delayedCall(100, () => {
      player.setVelocity(0, 0);
    });
  }

  onWaveComplete() {
    // 显示波次完成信息
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2 seconds...`);

    // 2秒后开始下一波
    this.waveTimer = this.time.delayedCall(2000, () => {
      this.statusText.setText('');
      this.startNextWave();
    });
  }

  fireBullet() {
    const time = this.time.now;
    if (time > this.lastFired + 200) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 20);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-500);
        this.lastFired = time;
      }
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);
    this.killsText.setText(`Total Kills: ${this.totalKills}`);
  }

  update(time, delta) {
    // 玩家移动
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理超出屏幕底部的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        // 检查波次是否完成
        if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
          this.isWaveActive = false;
          this.onWaveComplete();
        }
      }
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
  scene: GameScene
};

new Phaser.Game(config);