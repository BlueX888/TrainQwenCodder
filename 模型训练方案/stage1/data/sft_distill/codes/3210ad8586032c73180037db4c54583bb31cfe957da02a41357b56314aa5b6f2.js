class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 10;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
    this.score = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'playerTex');
    this.player.setCollideWorldBounds(true);
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 20
    });
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastShootTime = 0;
    this.shootDelay = 300; // 射击间隔
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    
    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff'
    });
    
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff'
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
    
    // 开始第一关
    this.startLevel();
  }

  createTextures() {
    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();
    
    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bulletTex', 4, 10);
    bulletGraphics.destroy();
    
    // 创建敌人纹理（青色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ffff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemyTex', 32, 32);
    enemyGraphics.destroy();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameCompleted = true;
      this.statusText.setText('恭喜通关！\n总分: ' + this.score);
      return;
    }
    
    // 计算当前关卡敌人数量
    this.remainingEnemies = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    
    // 清空现有敌人
    this.enemies.clear(true, true);
    
    // 生成敌人（使用固定种子保证可重现）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < this.remainingEnemies; i++) {
      // 使用伪随机但确定的位置
      const x = 50 + ((seed + i * 123) % 700);
      const y = 50 + ((seed + i * 456) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemyTex');
      enemy.setVelocity(
        ((seed + i * 789) % 100) - 50,
        ((seed + i * 321) % 50) + 20
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }
    
    // 更新UI
    this.updateUI();
    
    // 显示关卡开始提示
    this.statusText.setText('第 ' + this.currentLevel + ' 关开始！');
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return;
    }
    
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
    if (this.spaceKey.isDown && time > this.lastShootTime + this.shootDelay) {
      this.shoot();
      this.lastShootTime = time;
    }
    
    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
    
    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0 && this.enemies.countActive() === 0) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹消失
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    // 敌人消失
    enemy.destroy();
    
    // 更新计数和分数
    this.remainingEnemies--;
    this.score += 10;
    
    // 更新UI
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText('关卡: ' + this.currentLevel + ' / ' + this.maxLevel);
    this.enemyCountText.setText('剩余敌人: ' + this.remainingEnemies);
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

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}