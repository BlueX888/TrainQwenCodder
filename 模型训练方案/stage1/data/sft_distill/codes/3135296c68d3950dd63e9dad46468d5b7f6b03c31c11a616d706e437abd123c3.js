class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态变量
    this.currentWave = 0;
    this.killCount = 0;
    this.playerHealth = 3;
    this.baseEnemySpeed = 80;
    this.enemiesPerWave = 3;
    this.isGameOver = false;
    
    // 随机种子（可配置）
    this.seed = 12345;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);
    
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });
    
    // 创建UI
    this.createUI();
    
    // 设置碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);
    
    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 射击冷却
    this.canShoot = true;
    this.shootCooldown = 200;
    
    // 开始第一波
    this.startNextWave();
  }

  createTextures() {
    // 创建玩家纹理（三角形飞船）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  createPlayer() {
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24);
  }

  createUI() {
    // 波次显示
    this.waveText = this.add.text(16, 16, 'Wave: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // 击杀数显示
    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // 生命值显示
    this.healthText = this.add.text(16, 80, 'Health: 3', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // Game Over文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  startNextWave() {
    this.currentWave++;
    this.waveText.setText(`Wave: ${this.currentWave}`);
    
    // 计算当前波次的敌人数量和速度
    const enemyCount = this.enemiesPerWave + (this.currentWave - 1);
    const enemySpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    
    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      this.time.delayedCall(i * 500, () => {
        this.spawnEnemy(enemySpeed);
      });
    }
  }

  spawnEnemy(speed) {
    if (this.isGameOver) return;
    
    // 随机X位置
    const x = this.rng.between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    
    if (enemy) {
      enemy.setVelocityY(speed);
      enemy.body.setSize(24, 24);
      
      // 标记敌人速度（用于调试）
      enemy.enemySpeed = speed;
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();
    
    // 增加击杀数
    this.killCount++;
    this.killText.setText(`Kills: ${this.killCount}`);
    
    // 检查是否所有敌人都被消灭
    if (this.enemies.countActive() === 0) {
      // 延迟开始下一波
      this.time.delayedCall(2000, () => {
        if (!this.isGameOver) {
          this.startNextWave();
        }
      });
    }
  }

  hitPlayer(player, enemy) {
    // 销毁敌人
    enemy.destroy();
    
    // 减少生命值
    this.playerHealth--;
    this.healthText.setText(`Health: ${this.playerHealth}`);
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });
    
    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  shoot() {
    if (!this.canShoot || this.isGameOver) return;
    
    // 创建子弹
    const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
    
    if (bullet) {
      bullet.setVelocityY(-400);
      bullet.body.setSize(8, 8);
      
      // 设置射击冷却
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
  }

  gameOver() {
    this.isGameOver = true;
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 显示Game Over
    this.gameOverText.setVisible(true);
    
    // 显示最终统计
    const finalStats = this.add.text(400, 370, 
      `Final Wave: ${this.currentWave}\nTotal Kills: ${this.killCount}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    finalStats.setOrigin(0.5);
    
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;
    
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
    
    // 清理超出屏幕的敌人（算作漏掉，不减生命）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.destroy();
        
        // 检查是否所有敌人都消失
        if (this.enemies.countActive() === 0) {
          this.time.delayedCall(2000, () => {
            if (!this.isGameOver) {
              this.startNextWave();
            }
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

// 导出状态用于验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, EndlessWaveScene };
}