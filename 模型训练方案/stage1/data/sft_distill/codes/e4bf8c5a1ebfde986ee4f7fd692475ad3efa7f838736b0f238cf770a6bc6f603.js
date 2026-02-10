class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesPerWave = 15;
    this.enemySpeed = 200;
    this.waveDelay = 2000;
    this.isWaveActive = false;
    this.remainingEnemies = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建UI文本
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

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireRate = 200;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 开始第一波
    this.startWave();
  }

  startWave() {
    this.isWaveActive = true;
    this.remainingEnemies = this.enemiesPerWave;
    this.statusText.setText('');

    // 生成敌人
    for (let i = 0; i < this.enemiesPerWave; i++) {
      this.time.delayedCall(i * 200, () => {
        this.spawnEnemy();
      });
    }

    this.updateUI();
  }

  spawnEnemy() {
    // 随机生成位置（从屏幕上方或侧边）
    const spawnSide = Phaser.Math.Between(0, 2);
    let x, y, velocityX, velocityY;

    if (spawnSide === 0) {
      // 从上方生成
      x = Phaser.Math.Between(50, 750);
      y = -30;
      velocityX = Phaser.Math.Between(-100, 100);
      velocityY = this.enemySpeed;
    } else if (spawnSide === 1) {
      // 从左侧生成
      x = -30;
      y = Phaser.Math.Between(50, 300);
      velocityX = this.enemySpeed;
      velocityY = Phaser.Math.Between(-50, 50);
    } else {
      // 从右侧生成
      x = 830;
      y = Phaser.Math.Between(50, 300);
      velocityX = -this.enemySpeed;
      velocityY = Phaser.Math.Between(-50, 50);
    }

    const enemy = this.enemies.create(x, y, 'enemy');
    enemy.setVelocity(velocityX, velocityY);
    
    // 敌人离开屏幕后销毁
    enemy.setData('outOfBounds', false);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否所有敌人被消灭
    if (this.remainingEnemies <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.waveComplete();
    }
  }

  waveComplete() {
    this.statusText.setText(`Wave ${this.currentWave} Complete!\nNext wave in 2s...`);
    
    // 2秒后开始下一波
    this.time.delayedCall(this.waveDelay, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
  }

  fireBullet() {
    const currentTime = this.time.now;
    if (currentTime - this.lastFireTime < this.fireRate) {
      return;
    }

    this.lastFireTime = currentTime;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹离开屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
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

    // 射击
    if (this.spaceKey.isDown) {
      this.fireBullet();
    }

    // 清理离开屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.y > 650 || enemy.x < -50 || enemy.x > 850) {
        if (!enemy.getData('outOfBounds')) {
          enemy.setData('outOfBounds', true);
          this.remainingEnemies--;
          this.updateUI();
          
          if (this.remainingEnemies <= 0 && this.isWaveActive) {
            this.isWaveActive = false;
            this.waveComplete();
          }
        }
        enemy.destroy();
      }
    });

    // 清理离开屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.y < -20) {
        bullet.destroy();
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

const game = new Phaser.Game(config);

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentWave: scene.currentWave,
    remainingEnemies: scene.remainingEnemies,
    isWaveActive: scene.isWaveActive,
    enemiesPerWave: scene.enemiesPerWave,
    enemySpeed: scene.enemySpeed
  };
};