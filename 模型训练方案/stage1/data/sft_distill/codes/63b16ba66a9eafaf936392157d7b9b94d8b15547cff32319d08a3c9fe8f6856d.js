class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量（可验证）
    this.currentWave = 0;
    this.killCount = 0;
    this.isGameOver = false;
    this.enemiesRemaining = 0;
    
    // 随机种子（确保可复现）
    this.seed = 12345;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 设置随机种子
    Phaser.Math.RND.sow([this.seed]);
    
    // 创建玩家纹理
    this.createPlayerTexture();
    this.createEnemyTexture();
    this.createBulletTexture();
    
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
    this.canShoot = true;
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);
    
    // UI 文本
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    
    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    
    this.remainingText = this.add.text(16, 80, 'Remaining: 0', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setVisible(false);
    
    // 开始第一波
    this.startNextWave();
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(16, 0, 0, 32, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillTriangle(16, 32, 0, 0, 32, 0);
    graphics.generateTexture('enemy', 32, 32);
    graphics.destroy();
  }

  createBulletTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(0, 0, 4, 12);
    graphics.generateTexture('bullet', 4, 12);
    graphics.destroy();
  }

  startNextWave() {
    this.currentWave++;
    
    // 计算本波敌人数量和速度
    const enemyCount = 3 + (this.currentWave - 1);
    const enemySpeed = 360 + (this.currentWave - 1) * 20;
    
    this.enemiesRemaining = enemyCount;
    
    // 更新 UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
    
    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    if (this.isGameOver) return;
    
    // 随机 x 位置
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -32, 'enemy');
    enemy.setVelocityY(speed);
  }

  shoot() {
    if (!this.canShoot || this.isGameOver) return;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-600);
      
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.destroy();
    
    // 更新统计
    this.killCount++;
    this.enemiesRemaining--;
    
    this.killText.setText(`Kills: ${this.killCount}`);
    this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
    
    // 检查是否清空所有敌人
    if (this.enemiesRemaining <= 0 && this.enemies.countActive() === 0) {
      this.time.delayedCall(1000, () => {
        this.startNextWave();
      });
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    
    // 停止所有物理对象
    this.physics.pause();
    
    // 显示游戏结束信息
    this.gameOverText.setText(
      `GAME OVER\nWave: ${this.currentWave}\nKills: ${this.killCount}`
    ).setVisible(true);
    
    // 记录最终状态到控制台（便于验证）
    console.log('Game Over Stats:', {
      wave: this.currentWave,
      kills: this.killCount,
      seed: this.seed
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;
    
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-400);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(400);
    } else {
      this.player.setVelocityX(0);
    }
    
    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.shoot();
    }
    
    // 清理超出屏幕的子弹
    this.bullets.children.each(bullet => {
      if (bullet.active && bullet.y < -20) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
      }
    });
    
    // 清理超出屏幕的敌人
    this.enemies.children.each(enemy => {
      if (enemy.active && enemy.y > 620) {
        enemy.destroy();
        this.enemiesRemaining--;
        this.remainingText.setText(`Remaining: ${this.enemiesRemaining}`);
        
        // 检查波次结束
        if (this.enemiesRemaining <= 0 && this.enemies.countActive() === 0) {
          this.time.delayedCall(1000, () => {
            this.startNextWave();
          });
        }
      }
    });
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);