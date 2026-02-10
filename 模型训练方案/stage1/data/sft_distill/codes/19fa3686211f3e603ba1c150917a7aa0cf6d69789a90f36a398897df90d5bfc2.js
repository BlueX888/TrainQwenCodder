// 全局信号记录
window.__signals__ = {
  level: 1,
  enemiesTotal: 12,
  enemiesRemaining: 12,
  enemiesKilled: 0,
  gameComplete: false,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemies = 12;
    this.enemiesPerLevel = 2;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);
    
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建 UI
    this.createUI();
    
    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this.shoot());
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });
    
    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);
    
    // 开始关卡
    this.startLevel(this.currentLevel);
    
    // 记录初始事件
    this.logEvent('game_start', { level: 1 });
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
    
    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
  }

  createUI() {
    // 关卡显示
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    });
    
    // 敌人数显示
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    });
    
    // 提示文本
    this.hintText = this.add.text(400, 580, '方向键移动 | 空格射击', {
      fontSize: '16px',
      fill: '#aaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 胜利/失败文本（初始隐藏）
    this.messageText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#fff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);
  }

  startLevel(level) {
    // 清除现有敌人
    this.enemies.clear(true, true);
    
    // 计算敌人数量
    const enemyCount = this.baseEnemies + (level - 1) * this.enemiesPerLevel;
    
    // 更新全局信号
    window.__signals__.level = level;
    window.__signals__.enemiesTotal = enemyCount;
    window.__signals__.enemiesRemaining = enemyCount;
    
    // 创建敌人（使用固定种子生成位置）
    const seed = level * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 简单的伪随机算法（确定性）
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 100) + 20
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
    
    // 更新 UI
    this.updateUI();
    
    // 记录事件
    this.logEvent('level_start', { 
      level: level, 
      enemyCount: enemyCount 
    });
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`敌人: ${this.enemies.countActive(true)}/${window.__signals__.enemiesTotal}`);
  }

  shoot() {
    if (this.gameEnded) return;
    
    const bullet = this.bullets.get(this.player.x, this.player.y - 30, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      
      // 子弹超出屏幕后回收
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          this.bullets.killAndHide(bullet);
        }
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    this.bullets.killAndHide(bullet);
    enemy.destroy();
    
    // 更新信号
    window.__signals__.enemiesRemaining = this.enemies.countActive(true);
    window.__signals__.enemiesKilled++;
    
    // 更新 UI
    this.updateUI();
    
    // 记录事件
    this.logEvent('enemy_killed', {
      remaining: window.__signals__.enemiesRemaining
    });
    
    // 检查关卡完成
    if (this.enemies.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.gameEnded) return;
    
    this.logEvent('level_complete', { level: this.currentLevel });
    
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.gameWin();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(1500, () => {
        this.startLevel(this.currentLevel);
      });
      
      // 显示临时提示
      const tempText = this.add.text(400, 250, `第 ${this.currentLevel} 关完成！`, {
        fontSize: '36px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 5
      }).setOrigin(0.5);
      
      this.time.delayedCall(1500, () => {
        tempText.destroy();
      });
    }
  }

  gameWin() {
    this.gameEnded = true;
    window.__signals__.gameComplete = true;
    
    this.messageText.setText('恭喜通关！');
    this.messageText.setFill('#00ff00');
    this.messageText.setVisible(true);
    
    this.logEvent('game_win', {
      totalKills: window.__signals__.enemiesKilled
    });
    
    // 停止所有物理对象
    this.physics.pause();
  }

  gameOver() {
    if (this.gameEnded) return;
    
    this.gameEnded = true;
    this.messageText.setText('游戏结束');
    this.messageText.setFill('#ff0000');
    this.messageText.setVisible(true);
    
    this.logEvent('game_over', {
      level: this.currentLevel,
      kills: window.__signals__.enemiesKilled
    });
    
    this.physics.pause();
  }

  logEvent(eventName, data) {
    const event = {
      timestamp: Date.now(),
      event: eventName,
      data: data
    };
    window.__signals__.events.push(event);
    console.log('[GAME EVENT]', JSON.stringify(event));
  }

  update(time, delta) {
    if (this.gameEnded) return;
    
    // 玩家移动
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
    
    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        this.bullets.killAndHide(bullet);
      }
    });
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

new Phaser.Game(config);