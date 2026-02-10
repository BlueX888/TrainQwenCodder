class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 8;
    this.enemySpeed = 120;
    this.waveDelay = 2000; // 2秒
    this.isWaveActive = false;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（白色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
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
      maxSize: 20
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标点击射击
    this.input.on('pointerdown', (pointer) => {
      this.shootBullet(pointer);
    });

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一波
    this.startWave();
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

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.player, this.enemySpeed);
      }
    });

    // 更新UI
    this.updateUI();

    // 检查波次完成
    if (this.isWaveActive && this.enemies.countActive(true) === 0) {
      this.completeWave();
    }
  }

  startWave() {
    this.isWaveActive = true;
    this.enemiesKilled = 0;
    this.totalEnemies = this.enemiesPerWave;
    this.statusText.setText('');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnEnemy();
      });
    }
  }

  spawnEnemy() {
    // 随机选择屏幕边缘位置
    const side = Phaser.Math.Between(0, 3);
    let x, y;

    switch (side) {
      case 0: // 上
        x = Phaser.Math.Between(0, 800);
        y = -20;
        break;
      case 1: // 右
        x = 820;
        y = Phaser.Math.Between(0, 600);
        break;
      case 2: // 下
        x = Phaser.Math.Between(0, 800);
        y = 620;
        break;
      case 3: // 左
        x = -20;
        y = Phaser.Math.Between(0, 600);
        break;
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(false);
  }

  shootBullet(pointer) {
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
      
      this.physics.velocityFromRotation(angle, 400, bullet.body.velocity);
      
      // 子弹超出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    this.enemiesKilled++;
  }

  hitPlayer(player, enemy) {
    // 简单处理：敌人消失
    enemy.destroy();
    // 可以在这里添加玩家生命值系统
  }

  completeWave() {
    this.isWaveActive = false;
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2 seconds...`);
    
    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    const remaining = this.enemies.countActive(true);
    this.enemyCountText.setText(`Enemies: ${remaining}/${this.totalEnemies} | Killed: ${this.enemiesKilled}`);
  }
}

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
  scene: GameScene
};

const game = new Phaser.Game(config);

// 可验证状态（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    enemiesKilled: scene.enemiesKilled,
    activeEnemies: scene.enemies.countActive(true),
    isWaveActive: scene.isWaveActive,
    totalEnemies: scene.totalEnemies
  };
};