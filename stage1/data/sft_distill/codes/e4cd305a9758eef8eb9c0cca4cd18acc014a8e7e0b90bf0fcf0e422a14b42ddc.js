const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  health: 10,
  maxHealth: 10,
  gameOver: false,
  rightClickCount: 0
};

let healthBars = [];
let gameOverText = null;
let healthText = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文本
  const titleText = this.add.text(400, 50, 'Health Bar Demo', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建提示文本
  const hintText = this.add.text(400, 100, 'Right Click to Lose Health', {
    fontSize: '20px',
    color: '#aaaaaa'
  });
  hintText.setOrigin(0.5);
  
  // 创建血量显示文本
  healthText = this.add.text(400, 150, `Health: ${window.__signals__.health}/${window.__signals__.maxHealth}`, {
    fontSize: '24px',
    color: '#ff8800'
  });
  healthText.setOrigin(0.5);
  
  // 创建 10 格血条
  const barWidth = 50;
  const barHeight = 30;
  const barGap = 5;
  const totalWidth = (barWidth + barGap) * 10 - barGap;
  const startX = (800 - totalWidth) / 2;
  const startY = 200;
  
  for (let i = 0; i < 10; i++) {
    const graphics = this.add.graphics();
    
    // 绘制边框（深色）
    graphics.fillStyle(0x663300, 1);
    graphics.fillRect(
      startX + i * (barWidth + barGap),
      startY,
      barWidth,
      barHeight
    );
    
    // 绘制橙色血条
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(
      startX + i * (barWidth + barGap) + 2,
      startY + 2,
      barWidth - 4,
      barHeight - 4
    );
    
    healthBars.push(graphics);
  }
  
  // 创建 Game Over 文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER', {
    fontSize: '64px',
    color: '#ff0000',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 6
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
  
  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown() && !window.__signals__.gameOver) {
      loseHealth(scene);
    }
  });
  
  // 记录初始状态
  console.log(JSON.stringify({
    event: 'game_start',
    health: window.__signals__.health,
    timestamp: Date.now()
  }));
}

function loseHealth(scene) {
  if (window.__signals__.health > 0) {
    window.__signals__.health--;
    window.__signals__.rightClickCount++;
    
    // 隐藏对应的血格（从右往左）
    const barIndex = window.__signals__.health;
    if (healthBars[barIndex]) {
      healthBars[barIndex].setVisible(false);
    }
    
    // 更新血量文本
    healthText.setText(`Health: ${window.__signals__.health}/${window.__signals__.maxHealth}`);
    
    // 记录扣血事件
    console.log(JSON.stringify({
      event: 'health_lost',
      health: window.__signals__.health,
      rightClickCount: window.__signals__.rightClickCount,
      timestamp: Date.now()
    }));
    
    // 检查是否游戏结束
    if (window.__signals__.health === 0) {
      window.__signals__.gameOver = true;
      gameOverText.setVisible(true);
      
      // 添加闪烁效果
      scene.tweens.add({
        targets: gameOverText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      // 记录游戏结束事件
      console.log(JSON.stringify({
        event: 'game_over',
        totalRightClicks: window.__signals__.rightClickCount,
        timestamp: Date.now()
      }));
    }
  }
}

function update(time, delta) {
  // 每帧更新逻辑（本例中不需要）
}

new Phaser.Game(config);