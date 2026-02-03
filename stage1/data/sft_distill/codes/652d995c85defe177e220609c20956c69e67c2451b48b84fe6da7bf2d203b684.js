class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 1;
    this.enemiesAlive = 0;
    this.totalKills = 0;
    this.isWaveActive = false;
    this.nextWaveTimer = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理
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

    // 添加碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示UI
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.updateUI();

    // 开始第一波
    this.startWave();
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

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击（简单的冷却机制）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }

    // 检查敌人是否出界，如果出界则反弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.x < 0 || enemy.x > 800) {
        enemy.setVelocityX(-enemy.body.velocity.x);
      }
      if (enemy.y < 0 || enemy.y > 600) {
        enemy.setVelocityY(-enemy.body.velocity.y);
      }
    });

    // 检查波次是否完成
    if (this.isWaveActive && this.enemiesAlive === 0 && !this.nextWaveTimer) {
      this.isWaveActive = false;
      this.nextWaveTimer = this.time.addEvent({
        delay: 2000,
        callback: this.startNextWave,
        callbackScope: this
      });
      this.statusText.setText('Wave Complete! Next wave in 2 seconds...');
    }

    this.updateUI();
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesAlive = 10;
    
    // 生成10个敌人
    for (let i = 0; i < 10; i++) {
      // 随机位置（上半部分屏幕）
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 250);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度方向，速度大小为360
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const velocityX = Math.cos(angle) * 360;
      const velocityY = Math.sin(angle) * 360;
      
      enemy.setVelocity(velocityX, velocityY);
    }

    this.updateUI();
  }

  startNextWave() {
    this.wave++;
    this.nextWaveTimer = null;
    this.startWave();
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-500);
      
      // 子弹出界后回收
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          if (bullet.active) {
            bullet.setActive(false);
            bullet.setVisible(false);
          }
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    // 更新统计
    this.enemiesAlive--;
    this.totalKills++;
    
    this.updateUI();
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.wave}`);
    this.statusText.setText(
      `Enemies: ${this.enemiesAlive} | Total Kills: ${this.totalKills}`
    );
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

// 状态信号导出（用于验证）
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const scene = game.scene.scenes[0];
    return {
      wave: scene.wave,
      enemiesAlive: scene.enemiesAlive,
      totalKills: scene.totalKills,
      isWaveActive: scene.isWaveActive
    };
  };
}