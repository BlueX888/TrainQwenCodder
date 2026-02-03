class WaveGameScene extends Phaser.Scene {
  constructor() {
    super('WaveGameScene');
    this.currentWave = 1;
    this.enemiesKilled = 0;
    this.totalEnemiesPerWave = 12;
    this.enemySpeed = 360;
    this.isWaveActive = false;
    this.waveTimer = null;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 显示波次信息
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示敌人数量
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示状态信息
    this.statusText = this.add.text(16, 80, '', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 开始第一波
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    this.updateWaveText();
    
    // 生成12个敌人
    for (let i = 0; i < this.totalEnemiesPerWave; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    // 随机X位置，从屏幕上方生成
    const x = Phaser.Math.Between(50, 750);
    const y = -30;
    
    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-50, 50),
      this.enemySpeed
    );
    
    // 设置边界，超出屏幕下方销毁
    enemy.setCollideWorldBounds(false);
    
    // 添加简单的左右摆动
    this.tweens.add({
      targets: enemy,
      x: x + Phaser.Math.Between(-100, 100),
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    this.enemiesKilled++;
    
    // 检查是否消灭所有敌人
    if (this.enemies.countActive(true) === 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.statusText.setText('Wave Complete! Next wave in 2 seconds...');
      
      // 2秒后进入下一波
      if (this.waveTimer) {
        this.waveTimer.remove();
      }
      
      this.waveTimer = this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.currentWave++;
          this.statusText.setText('');
          this.startWave();
        },
        callbackScope: this
      });
    }
  }

  shoot() {
    const time = this.time.now;
    
    // 射击间隔200ms
    if (time > this.lastFired + 200) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 20);
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-600);
        
        this.lastFired = time;
      }
    }
  }

  updateWaveText() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)} / Total Killed: ${this.enemiesKilled}`);
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
    if (this.spaceKey.isDown) {
      this.shoot();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
      }
    });

    // 更新UI
    this.updateWaveText();

    // 输出可验证状态（用于测试）
    if (time % 1000 < 16) { // 每秒输出一次
      console.log(`[STATE] Wave: ${this.currentWave}, Enemies Alive: ${this.enemies.countActive(true)}, Total Killed: ${this.enemiesKilled}`);
    }
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
  scene: WaveGameScene
};

const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    enemiesKilled: scene.enemiesKilled,
    enemiesAlive: scene.enemies.countActive(true),
    isWaveActive: scene.isWaveActive
  };
};