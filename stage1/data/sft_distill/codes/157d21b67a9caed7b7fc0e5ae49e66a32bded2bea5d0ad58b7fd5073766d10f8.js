class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemies = 10;
    this.enemiesIncrement = 2;
    this.totalEnemies = 0;
    this.remainingEnemies = 0;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.fireKey = null;
    this.canFire = true;
    this.fireDelay = 300;
    this.levelText = null;
    this.enemyCountText = null;
    this.instructionText = null;
    this.gameOverText = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色矩形）
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
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
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

    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 设置碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 300, 'Arrow Keys: Move\nSpace: Shoot', {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);

    // 开始第一关
    this.startLevel();

    // 2秒后隐藏操作提示
    this.time.delayedCall(2000, () => {
      if (this.instructionText) {
        this.instructionText.destroy();
      }
    });
  }

  startLevel() {
    // 计算当前关卡敌人数量
    this.totalEnemies = this.baseEnemies + (this.currentLevel - 1) * this.enemiesIncrement;
    this.remainingEnemies = this.totalEnemies;

    // 更新UI
    this.updateUI();

    // 清除现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子保证可重现性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < this.totalEnemies; i++) {
      // 使用伪随机算法确保确定性
      const x = ((seed + i * 73) % 700) + 50;
      const y = ((seed + i * 137) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 97) % 100) - 50,
        ((seed + i * 113) % 100) - 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  update(time, delta) {
    if (this.gameOverText) {
      return; // 游戏结束，停止更新
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
    if (Phaser.Input.Keyboard.JustDown(this.fireKey) && this.canFire) {
      this.fire();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fire() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      this.canFire = false;
      this.time.delayedCall(this.fireDelay, () => {
        this.canFire = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 更新剩余敌人数
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否过关
    if (this.remainingEnemies <= 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.gameWin();
    } else {
      // 进入下一关
      this.currentLevel++;
      
      // 显示过关提示
      const levelCompleteText = this.add.text(400, 300, `Level ${this.currentLevel - 1} Complete!\nNext Level Starting...`, {
        fontSize: '32px',
        fill: '#00ff00',
        align: 'center'
      });
      levelCompleteText.setOrigin(0.5);

      // 2秒后开始下一关
      this.time.delayedCall(2000, () => {
        levelCompleteText.destroy();
        this.startLevel();
      });
    }
  }

  gameWin() {
    this.gameOverText = this.add.text(400, 300, 'CONGRATULATIONS!\nYou completed all 5 levels!', {
      fontSize: '36px',
      fill: '#ffd700',
      align: 'center'
    });
    this.gameOverText.setOrigin(0.5);

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.totalEnemies}`);
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

new Phaser.Game(config);