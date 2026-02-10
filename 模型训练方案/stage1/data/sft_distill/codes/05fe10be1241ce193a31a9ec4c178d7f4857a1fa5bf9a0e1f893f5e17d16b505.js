class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 8;
    this.enemyIncrement = 2;
    this.totalEnemiesKilled = 0;
    this.gameWon = false;
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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;
    this.fireDelay = 300;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#ffffff'
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
    // 玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('playerTex', 40, 40);
    playerGraphics.destroy();

    // 敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemyTex', 30, 30);
    enemyGraphics.destroy();

    // 子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bulletTex', 8, 8);
    bulletGraphics.destroy();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameWon = true;
      this.statusText.setText('GAME WON!\nAll 5 Levels Completed!');
      this.statusText.setVisible(true);
      return;
    }

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;

    // 生成敌人（使用固定种子保证确定性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 简单的伪随机位置（确定性）
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 193) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemyTex');
      enemy.setVelocity(
        ((seed + i * 97) % 100) - 50,
        ((seed + i * 73) % 100) - 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();
    
    // 显示关卡开始提示
    this.statusText.setText(`Level ${this.currentLevel} Start!`);
    this.statusText.setVisible(true);
    this.time.delayedCall(2000, () => {
      this.statusText.setVisible(false);
    });
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}`);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.totalEnemiesKilled++;

    // 更新UI
    this.updateUI();

    // 检查是否所有敌人都被消灭
    if (this.enemies.countActive(true) === 0) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  update(time, delta) {
    if (this.gameWon) {
      return;
    }

    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 发射子弹
    if (this.spaceKey.isDown && time > this.lastFireTime + this.fireDelay) {
      this.fireBullet();
      this.lastFireTime = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < 0 || bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
        bullet.destroy();
      }
    });
  }

  fireBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  // 可验证的状态信号
  getGameState() {
    return {
      currentLevel: this.currentLevel,
      maxLevel: this.maxLevel,
      enemiesRemaining: this.enemies.countActive(true),
      totalEnemiesKilled: this.totalEnemiesKilled,
      gameWon: this.gameWon,
      expectedEnemiesThisLevel: this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement
    };
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

// 暴露状态检查函数（用于验证）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return scene.getGameState();
};