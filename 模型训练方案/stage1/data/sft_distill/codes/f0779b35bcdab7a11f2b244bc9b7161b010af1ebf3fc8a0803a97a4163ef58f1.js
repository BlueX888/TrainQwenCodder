class EndlessWaveScene extends Phaser.Scene {
  constructor() {
    super('EndlessWaveScene');
    
    // 游戏状态
    this.currentWave = 1;
    this.killCount = 0;
    this.enemiesInWave = 5;
    this.baseEnemySpeed = 80;
    this.enemiesRemaining = 0;
    this.waveInProgress = false;
    
    // 游戏对象引用
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    
    // UI 文本
    this.waveText = null;
    this.killText = null;
    this.enemyCountText = null;
    this.instructionText = null;
  }

  preload() {
    // 无需加载外部资源，使用程序化生成纹理
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 50
    });
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });
    
    // 设置碰撞检测
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
      this.enemyHitPlayer,
      null,
      this
    );
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', this.shootBullet, this);
    
    // 创建UI
    this.createUI();
    
    // 开始第一波
    this.startWave();
  }

  createTextures() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 12);
    bulletGraphics.generateTexture('bullet', 4, 12);
    bulletGraphics.destroy();
  }

  createUI() {
    // 波次显示
    this.waveText = this.add.text(16, 16, 'Wave: 1', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // 击杀数显示
    this.killText = this.add.text(16, 48, 'Kills: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // 剩余敌人数显示
    this.enemyCountText = this.add.text(16, 80, 'Enemies: 0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    
    // 操作说明
    this.instructionText = this.add.text(400, 16, 'Arrow Keys: Move | Space: Shoot', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0);
  }

  startWave() {
    this.waveInProgress = true;
    this.enemiesRemaining = this.enemiesInWave;
    
    // 更新UI
    this.waveText.setText(`Wave: ${this.currentWave}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 计算当前波次的敌人速度
    const currentSpeed = this.baseEnemySpeed + (this.currentWave - 1) * 10;
    
    // 生成敌人（分批生成，避免一次性全部出现）
    let spawnedCount = 0;
    const spawnInterval = 800; // 每0.8秒生成一个
    
    const spawnTimer = this.time.addEvent({
      delay: spawnInterval,
      callback: () => {
        if (spawnedCount < this.enemiesInWave) {
          this.spawnEnemy(currentSpeed);
          spawnedCount++;
        } else {
          spawnTimer.remove();
        }
      },
      loop: true
    });
  }

  spawnEnemy(speed) {
    // 从屏幕顶部随机X位置生成敌人
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.get(x, -30);
    
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setVelocityY(speed);
      
      // 添加左右摇摆运动
      enemy.setVelocityX(Phaser.Math.Between(-30, 30));
    }
  }

  shootBullet() {
    if (!this.player.active) return;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  bulletHitEnemy(bullet, enemy) {
    // 子弹和敌人都消失
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);
    
    // 更新击杀数和剩余敌人数
    this.killCount++;
    this.enemiesRemaining--;
    
    this.killText.setText(`Kills: ${this.killCount}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 检查是否完成当前波次
    if (this.enemiesRemaining <= 0 && this.waveInProgress) {
      this.completeWave();
    }
  }

  enemyHitPlayer(player, enemy) {
    // 敌人消失
    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);
    
    this.enemiesRemaining--;
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    
    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    // 检查是否完成当前波次
    if (this.enemiesRemaining <= 0 && this.waveInProgress) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveInProgress = false;
    
    // 显示波次完成提示
    const completeText = this.add.text(400, 300, `Wave ${this.currentWave} Complete!`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // 2秒后开始下一波
    this.time.delayedCall(2000, () => {
      completeText.destroy();
      
      // 准备下一波
      this.currentWave++;
      this.enemiesInWave = 5 + (this.currentWave - 1); // 每波增加1个敌人
      
      this.startWave();
    });
  }

  update(time, delta) {
    if (!this.player.active) return;
    
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
    
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.setVelocity(0, 0);
      }
    });
    
    // 清理超出屏幕的敌人（到达底部）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 610) {
        enemy.setActive(false);
        enemy.setVisible(false);
        enemy.setVelocity(0, 0);
        
        this.enemiesRemaining--;
        this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
        
        // 检查是否完成当前波次
        if (this.enemiesRemaining <= 0 && this.waveInProgress) {
          this.completeWave();
        }
      }
    });
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, EndlessWaveScene };
}