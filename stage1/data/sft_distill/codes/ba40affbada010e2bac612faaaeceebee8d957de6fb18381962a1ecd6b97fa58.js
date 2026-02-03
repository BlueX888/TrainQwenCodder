class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentWave = 1;
    this.enemiesInWave = 3;
    this.enemiesRemaining = 0;
    this.isWaveActive = false;
    this.nextWaveTimer = null;
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

    // 创建敌人纹理（蓝色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 16);
    bulletGraphics.generateTexture('bullet', 8, 16);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.waveText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

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
    this.enemiesRemaining = this.enemiesInWave;
    
    this.statusText.setText('Wave Starting!');
    
    // 生成敌人
    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy();
      });
    }

    this.updateUI();
  }

  spawnEnemy() {
    // 随机X位置，从顶部生成
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    // 设置敌人向下移动，速度80
    enemy.setVelocityY(80);
    enemy.setCollideWorldBounds(false);
    
    // 敌人离开屏幕底部时销毁
    enemy.setData('active', true);
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 减少剩余敌人数
    this.enemiesRemaining--;
    this.updateUI();
    
    // 检查是否所有敌人都被消灭
    if (this.enemiesRemaining <= 0 && this.isWaveActive) {
      this.isWaveActive = false;
      this.waveComplete();
    }
  }

  waveComplete() {
    this.statusText.setText('Wave Complete! Next wave in 2 seconds...');
    
    // 2秒后开始下一波
    this.nextWaveTimer = this.time.delayedCall(2000, () => {
      this.currentWave++;
      this.startWave();
    });
  }

  shootBullet() {
    if (!this.canShoot) return;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  updateUI() {
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies Remaining: ${this.enemiesRemaining}`);
    
    if (this.enemiesRemaining === 0 && this.isWaveActive) {
      this.statusText.setText('All enemies defeated!');
    } else if (this.isWaveActive) {
      this.statusText.setText('Destroy all enemies!');
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

    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shootBullet();
    }

    // 清理离开屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.destroy();
      }
    });

    // 清理离开屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 620) {
        enemy.destroy();
        // 敌人逃脱也算作被"处理"
        if (this.isWaveActive) {
          this.enemiesRemaining--;
          this.updateUI();
          
          if (this.enemiesRemaining <= 0) {
            this.isWaveActive = false;
            this.waveComplete();
          }
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

const game = new Phaser.Game(config);